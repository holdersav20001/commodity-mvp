from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class ClaimGateStatus(StrEnum):
    allowed = "allowed"
    blocked = "blocked"
    contradicted = "contradicted"


class ClaimGateResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    target_type: str = Field(alias="targetType")
    target_id: str = Field(alias="targetId")
    claim: str
    status: ClaimGateStatus
    allowed_in_memo: bool = Field(alias="allowedInMemo")
    confidence: float = Field(ge=0, le=1)
    evidence_ids: list[str] = Field(alias="evidenceIds")
    supporting_evidence_ids: list[str] = Field(alias="supportingEvidenceIds")
    contradicting_evidence_ids: list[str] = Field(alias="contradictingEvidenceIds")
    reason: str
