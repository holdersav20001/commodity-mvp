from fastapi.testclient import TestClient


def test_list_cases_returns_metadata(client: TestClient) -> None:
    response = client.get("/api/cases")

    assert response.status_code == 200
    body = response.json()
    assert body == [
        {
            "id": "red-sea-shipping-risk",
            "title": "Red Sea Shipping Risk",
            "summary": "A curated oil-market case study showing how Red Sea disruption risk can support Brent and WTI through rerouting, freight pressure, and geopolitical risk premia.",
            "period": {
                "start": "2024-01-08",
                "end": "2024-01-19",
                "label": "January 2024 disruption window",
            },
            "primaryBenchmark": "brent",
        }
    ]


def test_get_red_sea_case_returns_full_case(client: TestClient) -> None:
    response = client.get("/api/cases/red-sea-shipping-risk")

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == "red-sea-shipping-risk"
    assert body["priceMove"]["brent"]["percentChange"] == 4.2
    assert body["events"][0]["evidenceIds"]
    assert body["claimGates"]
    assert any(
        gate["targetId"] == "route-red-sea-suez" and gate["status"] == "allowed"
        for gate in body["claimGates"]
    )


def test_get_unknown_case_returns_404(client: TestClient) -> None:
    response = client.get("/api/cases/not-real")

    assert response.status_code == 404
    assert response.json()["detail"] == "Case study 'not-real' was not found"


def test_get_red_sea_case_memo_returns_evidence_gated_memo(client: TestClient) -> None:
    response = client.get("/api/cases/red-sea-shipping-risk/memo")

    assert response.status_code == 200
    body = response.json()
    assert body["caseId"] == "red-sea-shipping-risk"
    assert body["headline"] == "Red Sea Shipping Risk: evidence-gated oil-market memo"
    assert body["bullishDrivers"]
    assert body["citations"]
    assert any(
        claim["targetId"] == "evt-bab-el-mandeb-risk"
        for claim in body["blockedClaims"]
    )
