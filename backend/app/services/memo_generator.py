from dataclasses import dataclass
from typing import Protocol

from app.schemas.case_study import CaseStudy, Evidence, Source
from app.schemas.evidence_gate import ClaimGateResult
from app.schemas.memo import (
    BlockedClaimSummary,
    GeneratedMemo,
    MemoCitation,
    MemoDriver,
)


class MemoTarget(Protocol):
    id: str
    title: str
    description: str
    impact_direction: str


@dataclass(frozen=True)
class TargetContext:
    target_type: str
    target: MemoTarget


class MemoGenerator:
    def generate(self, case: CaseStudy, claim_gates: list[ClaimGateResult]) -> GeneratedMemo:
        allowed_gates = [gate for gate in claim_gates if gate.allowed_in_memo]
        blocked_gates = [gate for gate in claim_gates if not gate.allowed_in_memo]
        target_by_id = {target.target.id: target for target in self._targets(case)}
        evidence_by_id = {evidence.id: evidence for evidence in case.evidence}
        source_by_id = {source.id: source for source in case.sources}
        citations = self._citations(allowed_gates, evidence_by_id, source_by_id)
        drivers = [
            self._driver(gate, target_by_id[gate.target_id], citations)
            for gate in allowed_gates
            if gate.target_id in target_by_id
        ]
        bullish_drivers = [
            driver for driver in drivers if driver.direction in {"bullish", "mixed"}
        ]
        bearish_drivers = [
            driver for driver in drivers if driver.direction == "bearish"
        ]

        summary = self._summary(case, bullish_drivers, bearish_drivers)

        return GeneratedMemo(
            caseId=case.id,
            headline=f"{case.title}: evidence-gated oil-market memo",
            summary=summary,
            bullishDrivers=bullish_drivers,
            bearishDrivers=bearish_drivers,
            citations=citations,
            blockedClaims=[
                BlockedClaimSummary(
                    targetId=gate.target_id,
                    status=gate.status,
                    reason=gate.reason,
                )
                for gate in blocked_gates
            ],
            confidence=self._memo_confidence(allowed_gates),
        )

    def _targets(self, case: CaseStudy) -> list[TargetContext]:
        return [
            *[TargetContext("event", event) for event in case.events],
            *[TargetContext("route", route) for route in case.routes],
            *[TargetContext("indicator", indicator) for indicator in case.indicators],
            *[TargetContext("counter_signal", signal) for signal in case.counter_signals],
        ]

    def _driver(
        self,
        gate: ClaimGateResult,
        target_context: TargetContext,
        citations: list[MemoCitation],
    ) -> MemoDriver:
        citation_ids = [
            citation.evidence_id
            for citation in citations
            if citation.evidence_id in gate.supporting_evidence_ids
        ]
        target = target_context.target
        return MemoDriver(
            targetId=target.id,
            title=target.title,
            direction=str(target.impact_direction),
            confidence=gate.confidence,
            explanation=target.description,
            citationIds=citation_ids,
        )

    def _citations(
        self,
        gates: list[ClaimGateResult],
        evidence_by_id: dict[str, Evidence],
        source_by_id: dict[str, Source],
    ) -> list[MemoCitation]:
        citation_by_id: dict[str, MemoCitation] = {}
        for gate in gates:
            for evidence_id in gate.supporting_evidence_ids:
                if evidence_id in citation_by_id:
                    continue
                evidence = evidence_by_id.get(evidence_id)
                if evidence is None:
                    continue
                source = source_by_id.get(evidence.source_id)
                if source is None:
                    continue
                citation_by_id[evidence_id] = MemoCitation(
                    evidenceId=evidence.id,
                    sourceId=source.id,
                    sourceTitle=source.title,
                    organization=source.organization,
                    excerpt=evidence.excerpt,
                )
        return list(citation_by_id.values())

    def _summary(
        self,
        case: CaseStudy,
        bullish_drivers: list[MemoDriver],
        bearish_drivers: list[MemoDriver],
    ) -> str:
        primary_move = case.price_move.brent.percent_change
        bullish_text = self._driver_titles(bullish_drivers) or "no allowed bullish drivers"
        bearish_text = self._driver_titles(bearish_drivers) or "no allowed bearish drivers"
        return (
            f"Brent moved {primary_move:+.1f}% over {case.period.label}. "
            f"Allowed evidence highlights {bullish_text}. "
            f"Counter-pressure from {bearish_text} is separated from blocked or contradicted claims."
        )

    def _driver_titles(self, drivers: list[MemoDriver]) -> str:
        return ", ".join(driver.title for driver in drivers[:3])

    def _memo_confidence(self, gates: list[ClaimGateResult]) -> float:
        if not gates:
            return 0
        return round(sum(gate.confidence for gate in gates) / len(gates), 3)
