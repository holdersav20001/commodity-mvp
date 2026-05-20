from fastapi.testclient import TestClient
from pathlib import Path

from app.api.market_data import get_cftc_provider, get_eia_provider, get_history_repository
from app.repositories.market_history_repository import MarketHistoryRepository
from app.schemas.case_study import ImpactDirection
from app.schemas.market_data import (
    CftcPositioningSnapshot,
    DataSource,
    FuturesPositioningPoint,
)


class MissingEiaProvider:
    def fetch_snapshot(self, *, periods: int):
        from app.providers.eia_fundamentals_provider import EiaDataUnavailableError

        raise EiaDataUnavailableError("EIA_API_KEY is required")


class StubCftcProvider:
    def fetch_snapshot(self, *, periods: int):
        return CftcPositioningSnapshot(
            source=DataSource(
                id="cftc",
                title="CFTC",
                organization="CFTC",
                url="https://publicreporting.cftc.gov/resource/72hh-3qpy.json",
                retrievedAt="2026-05-19T00:00:00Z",
            ),
            market="WTI-PHYSICAL - NEW YORK MERCANTILE EXCHANGE",
            contractCode="067651",
            latestPeriod="2026-05-12",
            managedMoneyNet=72801,
            managedMoneyNetChange=2010,
            pricePressure=ImpactDirection.bullish,
            interpretation="Managed money net positioning increased.",
            points=[
                FuturesPositioningPoint(
                    period="2026-05-12",
                    openInterest=2081927,
                    managedMoneyLong=187332,
                    managedMoneyShort=114531,
                    managedMoneyNet=72801,
                    producerMerchantNet=357407,
                    swapDealerNet=-553541,
                )
            ],
        )


def test_oil_market_data_returns_partial_snapshot_when_eia_key_missing(
    client: TestClient, tmp_path: Path
) -> None:
    client.app.dependency_overrides[get_eia_provider] = lambda: MissingEiaProvider()
    client.app.dependency_overrides[get_cftc_provider] = lambda: StubCftcProvider()
    client.app.dependency_overrides[get_history_repository] = lambda: MarketHistoryRepository(
        tmp_path / "history.sqlite3"
    )

    try:
        response = client.get("/api/market-data/oil")
    finally:
        client.app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["fundamentals"] is None
    assert body["futuresPositioning"]["managedMoneyNet"] == 72801
    assert body["history"]["storedObservations"] == 2
    assert body["history"]["ingestedObservations"] == 2
    assert any(
        trend["seriesId"] == "cftc:managed_money_net"
        for trend in body["history"]["seriesTrends"]
    )
    assert body["warnings"] == ["EIA_API_KEY is required"]
