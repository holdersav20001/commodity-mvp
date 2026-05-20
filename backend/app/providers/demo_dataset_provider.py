import json
from functools import cached_property
from pathlib import Path
from typing import Any

from pydantic import ValidationError

from app.providers.base import CaseStudyProvider
from app.schemas.case_study import CaseStudy, CaseStudySummary


class CaseStudyNotFoundError(LookupError):
    pass


class InvalidCaseStudyError(ValueError):
    pass


class DemoDatasetProvider(CaseStudyProvider):
    def __init__(self, cases_dir: Path | None = None) -> None:
        self.cases_dir = cases_dir or Path(__file__).resolve().parents[2] / "data" / "cases"

    def list_cases(self) -> list[CaseStudySummary]:
        return [
            CaseStudySummary.model_validate(case.model_dump(by_alias=True))
            for case in sorted(self._cases_by_id.values(), key=lambda item: item.title)
        ]

    def get_case(self, case_id: str) -> CaseStudy:
        try:
            return self._cases_by_id[case_id]
        except KeyError as exc:
            raise CaseStudyNotFoundError(f"Case study '{case_id}' was not found") from exc

    @cached_property
    def _cases_by_id(self) -> dict[str, CaseStudy]:
        cases: dict[str, CaseStudy] = {}
        for case_file in sorted(self.cases_dir.glob("*.json")):
            case = self._load_case(case_file)
            if case.id in cases:
                raise InvalidCaseStudyError(f"Duplicate case study id '{case.id}'")
            cases[case.id] = case
        return cases

    def _load_case(self, case_file: Path) -> CaseStudy:
        try:
            payload = json.loads(case_file.read_text(encoding="utf-8"))
            case = CaseStudy.model_validate(payload)
            self._validate_references(case)
            return case
        except json.JSONDecodeError as exc:
            raise InvalidCaseStudyError(f"{case_file.name} is not valid JSON") from exc
        except ValidationError as exc:
            raise InvalidCaseStudyError(f"{case_file.name} failed schema validation") from exc

    def _validate_references(self, case: CaseStudy) -> None:
        evidence_ids = {item.id for item in case.evidence}
        source_ids = {item.id for item in case.sources}

        for evidence in case.evidence:
            if evidence.source_id not in source_ids:
                self._raise_reference_error(case.id, "evidence", evidence.id, evidence.source_id)

        referenced_evidence = self._collect_evidence_references(case)
        missing = sorted(referenced_evidence - evidence_ids)
        if missing:
            raise InvalidCaseStudyError(
                f"Case study '{case.id}' references unknown evidence ids: {', '.join(missing)}"
            )

        evidence_targets = self._collect_evidence_targets(case)
        for evidence in case.evidence:
            for target_id in [*evidence.supports, *evidence.contradicts]:
                if target_id not in evidence_targets:
                    self._raise_reference_error(case.id, "evidence target", evidence.id, target_id)

    def _collect_evidence_references(self, case: CaseStudy) -> set[str]:
        references: set[str] = set()
        for collection in [
            case.events,
            case.routes,
            case.regions,
            case.indicators,
            case.counter_signals,
        ]:
            for item in collection:
                references.update(item.evidence_ids)
        return references

    def _collect_evidence_targets(self, case: CaseStudy) -> set[str]:
        targets: set[str] = set()
        for collection in [
            case.events,
            case.routes,
            case.regions,
            case.indicators,
            case.counter_signals,
            case.scenarios,
        ]:
            targets.update(item.id for item in collection)
        return targets

    def _raise_reference_error(
        self, case_id: str, entity_type: str, entity_id: str, missing_id: Any
    ) -> None:
        raise InvalidCaseStudyError(
            f"Case study '{case_id}' {entity_type} '{entity_id}' references unknown id '{missing_id}'"
        )
