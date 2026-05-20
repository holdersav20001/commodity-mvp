from pydantic import BaseModel, ConfigDict, Field


class MemoCitation(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    evidence_id: str = Field(alias="evidenceId")
    source_id: str = Field(alias="sourceId")
    source_title: str = Field(alias="sourceTitle")
    organization: str
    excerpt: str


class MemoDriver(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    target_id: str = Field(alias="targetId")
    title: str
    direction: str
    confidence: float = Field(ge=0, le=1)
    explanation: str
    citation_ids: list[str] = Field(alias="citationIds")


class BlockedClaimSummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    target_id: str = Field(alias="targetId")
    status: str
    reason: str


class GeneratedMemo(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    case_id: str = Field(alias="caseId")
    headline: str
    summary: str
    bullish_drivers: list[MemoDriver] = Field(alias="bullishDrivers")
    bearish_drivers: list[MemoDriver] = Field(alias="bearishDrivers")
    citations: list[MemoCitation]
    blocked_claims: list[BlockedClaimSummary] = Field(alias="blockedClaims")
    confidence: float = Field(ge=0, le=1)
