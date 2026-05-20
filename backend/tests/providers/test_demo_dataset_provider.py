import json
from pathlib import Path

import pytest

from app.providers.demo_dataset_provider import (
    CaseStudyNotFoundError,
    DemoDatasetProvider,
    InvalidCaseStudyError,
)


def test_provider_lists_red_sea_case() -> None:
    provider = DemoDatasetProvider()

    cases = provider.list_cases()

    assert [case.id for case in cases] == ["red-sea-shipping-risk"]


def test_provider_returns_schema_valid_red_sea_case() -> None:
    provider = DemoDatasetProvider()

    case = provider.get_case("red-sea-shipping-risk")

    assert case.title == "Red Sea Shipping Risk"
    assert case.events
    assert case.evidence


def test_unknown_case_id_raises_expected_error() -> None:
    provider = DemoDatasetProvider()

    with pytest.raises(CaseStudyNotFoundError):
        provider.get_case("missing-case")


def test_invalid_fixture_fails_validation(tmp_path: Path) -> None:
    case_file = tmp_path / "invalid.json"
    case_file.write_text(json.dumps({"id": "invalid"}), encoding="utf-8")

    provider = DemoDatasetProvider(cases_dir=tmp_path)

    with pytest.raises(InvalidCaseStudyError):
        provider.list_cases()


def test_event_evidence_references_resolve() -> None:
    case = DemoDatasetProvider().get_case("red-sea-shipping-risk")
    evidence_ids = {evidence.id for evidence in case.evidence}

    for event in case.events:
        assert event.evidence_ids
        assert set(event.evidence_ids).issubset(evidence_ids)


def test_evidence_source_references_resolve() -> None:
    case = DemoDatasetProvider().get_case("red-sea-shipping-risk")
    source_ids = {source.id for source in case.sources}

    for evidence in case.evidence:
        assert evidence.source_id in source_ids


def test_route_evidence_and_trade_flow_metadata_resolve() -> None:
    case = DemoDatasetProvider().get_case("red-sea-shipping-risk")
    evidence_ids = {evidence.id for evidence in case.evidence}

    assert {route.route_kind for route in case.routes} >= {
        "security_risk",
        "reroute",
        "alternate_supply",
    }
    for route in case.routes:
        assert route.origin.role == "origin"
        assert route.destination.role == "destination"
        assert route.price_mechanisms
        assert set(route.evidence_ids).issubset(evidence_ids)


def test_evidence_support_targets_resolve(tmp_path: Path) -> None:
    source = Path("data/cases/red-sea-shipping-risk.json")
    payload = json.loads(source.read_text(encoding="utf-8"))
    payload["evidence"][0]["supports"].append("missing-target")
    case_file = tmp_path / "invalid-target.json"
    case_file.write_text(json.dumps(payload), encoding="utf-8")

    provider = DemoDatasetProvider(cases_dir=tmp_path)

    with pytest.raises(InvalidCaseStudyError, match="missing-target"):
        provider.list_cases()
