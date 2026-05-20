from fastapi import APIRouter, HTTPException

from app.providers.demo_dataset_provider import (
    CaseStudyNotFoundError,
    DemoDatasetProvider,
)
from app.schemas.case_study import CaseStudy, CaseStudySummary
from app.schemas.memo import GeneratedMemo
from app.services.evidence_gate import EvidenceGateService
from app.services.memo_generator import MemoGenerator


router = APIRouter(prefix="/cases", tags=["cases"])
provider = DemoDatasetProvider()
evidence_gate = EvidenceGateService()
memo_generator = MemoGenerator()


@router.get("", response_model=list[CaseStudySummary])
def list_cases() -> list[CaseStudySummary]:
    return provider.list_cases()


@router.get("/{case_id}", response_model=CaseStudy)
def get_case(case_id: str) -> CaseStudy:
    try:
        case = provider.get_case(case_id)
        return case.model_copy(update={"claim_gates": evidence_gate.evaluate_case(case)})
    except CaseStudyNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{case_id}/memo", response_model=GeneratedMemo)
def get_case_memo(case_id: str) -> GeneratedMemo:
    try:
        case = provider.get_case(case_id)
        gates = evidence_gate.evaluate_case(case)
        return memo_generator.generate(case, gates)
    except CaseStudyNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
