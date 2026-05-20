from app.providers.demo_dataset_provider import DemoDatasetProvider
from app.services.evidence_gate import EvidenceGateService
from app.services.memo_generator import MemoGenerator


def test_generates_memo_from_allowed_claims_only() -> None:
    case = DemoDatasetProvider().get_case("red-sea-shipping-risk")
    gates = EvidenceGateService().evaluate_case(case)

    memo = MemoGenerator().generate(case, gates)

    assert memo.headline == "Red Sea Shipping Risk: evidence-gated oil-market memo"
    assert memo.bullish_drivers
    assert memo.citations
    assert all(driver.citation_ids for driver in memo.bullish_drivers)


def test_blocked_or_contradicted_claims_do_not_enter_driver_sections() -> None:
    case = DemoDatasetProvider().get_case("red-sea-shipping-risk")
    gates = EvidenceGateService().evaluate_case(case)

    memo = MemoGenerator().generate(case, gates)

    driver_target_ids = {
        driver.target_id for driver in [*memo.bullish_drivers, *memo.bearish_drivers]
    }
    blocked_target_ids = {claim.target_id for claim in memo.blocked_claims}
    assert "evt-bab-el-mandeb-risk" in blocked_target_ids
    assert blocked_target_ids.isdisjoint(driver_target_ids)


def test_memo_summarizes_blocked_claims_separately() -> None:
    case = DemoDatasetProvider().get_case("red-sea-shipping-risk")
    gates = EvidenceGateService().evaluate_case(case)

    memo = MemoGenerator().generate(case, gates)

    blocked_claim = next(
        claim for claim in memo.blocked_claims if claim.target_id == "evt-bab-el-mandeb-risk"
    )
    assert blocked_claim.status == "contradicted"
    assert "review" in blocked_claim.reason
