from app.providers.demo_dataset_provider import DemoDatasetProvider
from app.schemas.case_study import CaseStudy
from app.services.evidence_gate import EvidenceGateService


def test_supported_route_claim_is_allowed() -> None:
    case = DemoDatasetProvider().get_case("red-sea-shipping-risk")

    gates = EvidenceGateService().evaluate_case(case)

    route_gate = _gate_for(gates, "route-red-sea-suez")
    assert route_gate.status == "allowed"
    assert route_gate.allowed_in_memo is True
    assert route_gate.supporting_evidence_ids == ["ev-red-sea-rerouting"]
    assert route_gate.confidence > 0


def test_unsupported_claim_is_blocked() -> None:
    case = DemoDatasetProvider().get_case("red-sea-shipping-risk")
    payload = case.model_dump(by_alias=True)
    payload["routes"][0]["evidenceIds"] = ["ev-dollar-counter-signal"]
    unsupported_case = CaseStudy.model_validate(payload)

    gates = EvidenceGateService().evaluate_case(unsupported_case)

    route_gate = _gate_for(gates, "route-red-sea-suez")
    assert route_gate.status == "blocked"
    assert route_gate.allowed_in_memo is False
    assert route_gate.supporting_evidence_ids == []
    assert route_gate.confidence == 0


def test_contradicted_claim_is_flagged_and_excluded_from_memo() -> None:
    case = DemoDatasetProvider().get_case("red-sea-shipping-risk")

    gates = EvidenceGateService().evaluate_case(case)

    event_gate = _gate_for(gates, "evt-bab-el-mandeb-risk")
    assert event_gate.status == "contradicted"
    assert event_gate.allowed_in_memo is False
    assert event_gate.contradicting_evidence_ids == ["ev-dollar-counter-signal"]


def _gate_for(gates, target_id: str):
    return next(gate for gate in gates if gate.target_id == target_id)
