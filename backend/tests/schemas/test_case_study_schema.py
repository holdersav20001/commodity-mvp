import pytest
from pydantic import ValidationError

from app.schemas.case_study import CaseStudy, Coordinates


def test_valid_minimal_case_study_passes() -> None:
    case = CaseStudy.model_validate(_minimal_case_payload())

    assert case.id == "minimal-case"
    assert case.events[0].impact_direction == "bullish"


def test_invalid_impact_direction_fails() -> None:
    payload = _minimal_case_payload()
    payload["events"][0]["impactDirection"] = "sideways"

    with pytest.raises(ValidationError):
        CaseStudy.model_validate(payload)


def test_invalid_impact_type_fails() -> None:
    payload = _minimal_case_payload()
    payload["events"][0]["impactType"] = "rumor"

    with pytest.raises(ValidationError):
        CaseStudy.model_validate(payload)


def test_invalid_coordinates_fail() -> None:
    with pytest.raises(ValidationError):
        Coordinates(longitude=181, latitude=20)

    with pytest.raises(ValidationError):
        Coordinates(longitude=10, latitude=-91)


def test_severity_and_confidence_outside_range_fail() -> None:
    payload = _minimal_case_payload()
    payload["events"][0]["severity"] = 1.2

    with pytest.raises(ValidationError):
        CaseStudy.model_validate(payload)

    payload = _minimal_case_payload()
    payload["events"][0]["confidence"] = -0.1

    with pytest.raises(ValidationError):
        CaseStudy.model_validate(payload)


def test_route_requires_trade_flow_metadata() -> None:
    payload = _minimal_case_payload()
    payload["routes"] = [_route_payload()]

    case = CaseStudy.model_validate(payload)

    assert case.routes[0].commodity == "crude_oil"
    assert case.routes[0].route_kind == "alternate_supply"
    assert case.routes[0].origin.role == "origin"
    assert case.routes[0].price_mechanisms == ["supply_substitution"]


def test_route_without_price_mechanism_fails() -> None:
    payload = _minimal_case_payload()
    route = _route_payload()
    route["priceMechanisms"] = []
    payload["routes"] = [route]

    with pytest.raises(ValidationError):
        CaseStudy.model_validate(payload)


def _route_payload() -> dict:
    return {
        "id": "route-1",
        "title": "U.S. Gulf to Europe",
        "description": "A valid route with trade-flow metadata.",
        "commodity": "crude_oil",
        "routeKind": "alternate_supply",
        "origin": {
            "id": "origin-1",
            "title": "Origin",
            "role": "origin",
            "coordinates": {"longitude": -95, "latitude": 28},
        },
        "destination": {
            "id": "dest-1",
            "title": "Destination",
            "role": "destination",
            "coordinates": {"longitude": 4, "latitude": 52},
        },
        "coordinates": [
            {"longitude": -95, "latitude": 28},
            {"longitude": -40, "latitude": 44},
            {"longitude": 4, "latitude": 52},
        ],
        "priceMechanisms": ["supply_substitution"],
        "impactDirection": "bullish",
        "impactType": "supply",
        "severity": 0.55,
        "confidence": 0.72,
        "evidenceIds": ["ev-1"],
    }


def _minimal_case_payload() -> dict:
    return {
        "id": "minimal-case",
        "title": "Minimal Case",
        "summary": "A minimal valid case for schema tests.",
        "period": {"start": "2024-01-01", "end": "2024-01-07", "label": "Test week"},
        "primaryBenchmark": "brent",
        "priceMove": {
            "brent": {
                "startPrice": 75.0,
                "endPrice": 77.0,
                "percentChange": 2.6,
                "unit": "USD/bbl",
            },
            "wti": {
                "startPrice": 70.0,
                "endPrice": 71.0,
                "percentChange": 1.4,
                "unit": "USD/bbl",
            },
        },
        "mapFocus": {"center": {"longitude": 0, "latitude": 0}, "zoom": 2},
        "events": [
            {
                "id": "evt-1",
                "title": "Supply risk event",
                "description": "A valid event.",
                "locationName": "Test location",
                "coordinates": {"longitude": 10, "latitude": 20},
                "impactDirection": "bullish",
                "impactType": "supply",
                "severity": 0.5,
                "confidence": 0.6,
                "timeHorizon": "short",
                "affectedBenchmarks": ["brent"],
                "evidenceIds": ["ev-1"],
            }
        ],
        "routes": [],
        "regions": [],
        "indicators": [],
        "evidence": [
            {
                "id": "ev-1",
                "sourceId": "src-1",
                "claim": "The event supports prices.",
                "excerpt": "A concise evidence excerpt.",
                "relevance": 0.8,
                "supports": ["evt-1"],
            }
        ],
        "sources": [
            {
                "id": "src-1",
                "title": "Test Source",
                "organization": "MacroSignal",
                "url": None,
                "publishedAt": "2024-01-07",
            }
        ],
        "counterSignals": [
            {
                "id": "cs-1",
                "title": "Counter signal",
                "description": "A valid counter signal.",
                "impactDirection": "bearish",
                "evidenceIds": ["ev-1"],
            }
        ],
        "watchIndicators": [
            {
                "id": "watch-1",
                "title": "Watch item",
                "description": "A useful watch indicator.",
            }
        ],
        "scenarios": [
            {
                "id": "scenario-1",
                "title": "Base scenario",
                "assumptions": {
                    "opecPolicy": "cuts_hold",
                    "shippingRisk": "elevated",
                    "chinaDemand": "stable",
                    "fedUsd": "neutral",
                    "inventories": "neutral",
                    "transitionPressure": "baseline",
                    "horizon": "2_6_weeks",
                },
                "historicalAnalogues": ["Prior test analogue"],
                "invalidatingSignals": ["A useful invalidating signal"],
            }
        ],
    }
