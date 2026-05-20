from dataclasses import dataclass
from typing import Protocol

from app.schemas.case_study import CaseStudy, Evidence
from app.schemas.evidence_gate import ClaimGateResult, ClaimGateStatus


class EvidenceBackedTarget(Protocol):
    id: str
    title: str
    description: str
    confidence: float
    evidence_ids: list[str]


@dataclass(frozen=True)
class ClaimTarget:
    target_type: str
    target: EvidenceBackedTarget


class EvidenceGateService:
    def evaluate_case(self, case: CaseStudy) -> list[ClaimGateResult]:
        evidence_by_id = {evidence.id: evidence for evidence in case.evidence}
        return [
            self._evaluate_target(target, evidence_by_id)
            for target in self._claim_targets(case)
        ]

    def _evaluate_target(
        self,
        claim_target: ClaimTarget,
        evidence_by_id: dict[str, Evidence],
    ) -> ClaimGateResult:
        target = claim_target.target
        available_evidence = [
            evidence
            for evidence_id in target.evidence_ids
            if (evidence := evidence_by_id.get(evidence_id)) is not None
        ]
        supporting = [
            evidence.id for evidence in available_evidence if target.id in evidence.supports
        ]
        contradicting = [
            evidence.id for evidence in evidence_by_id.values() if target.id in evidence.contradicts
        ]

        if contradicting:
            status = ClaimGateStatus.contradicted
            reason = "Claim has explicit contradictory evidence and must be reviewed before memo use."
            allowed = False
            confidence = min(self._target_confidence(target), 0.35)
        elif supporting:
            status = ClaimGateStatus.allowed
            reason = "Claim is supported by linked evidence and can be used in the memo."
            allowed = True
            confidence = self._confidence(self._target_confidence(target), available_evidence)
        else:
            status = ClaimGateStatus.blocked
            reason = "Claim is missing linked supporting evidence and is blocked from memo use."
            allowed = False
            confidence = 0

        return ClaimGateResult(
            id=f"gate-{target.id}",
            targetType=claim_target.target_type,
            targetId=target.id,
            claim=target.description,
            status=status,
            allowedInMemo=allowed,
            confidence=confidence,
            evidenceIds=target.evidence_ids,
            supportingEvidenceIds=supporting,
            contradictingEvidenceIds=contradicting,
            reason=reason,
        )

    def _claim_targets(self, case: CaseStudy) -> list[ClaimTarget]:
        return [
            *[ClaimTarget("event", event) for event in case.events],
            *[ClaimTarget("route", route) for route in case.routes],
            *[ClaimTarget("region", region) for region in case.regions],
            *[ClaimTarget("indicator", indicator) for indicator in case.indicators],
            *[ClaimTarget("counter_signal", signal) for signal in case.counter_signals],
        ]

    def _confidence(
        self,
        target_confidence: float,
        available_evidence: list[Evidence],
    ) -> float:
        if not available_evidence:
            return 0

        average_relevance = sum(evidence.relevance for evidence in available_evidence) / len(
            available_evidence
        )
        return round((target_confidence * 0.65) + (average_relevance * 0.35), 3)

    def _target_confidence(self, target: EvidenceBackedTarget) -> float:
        return getattr(target, "confidence", 0.5)
