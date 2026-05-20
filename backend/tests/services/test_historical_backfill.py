from pathlib import Path

from app.repositories.market_history_repository import MarketHistoryRepository
from app.schemas.case_study import ImpactDirection
from app.schemas.market_data import (
    CftcPositioningSnapshot,
    DataSource,
    EiaFundamentalsSnapshot,
    FundamentalMetricKind,
    FundamentalSeries,
    FuturesPositioningPoint,
    MarketObservation,
)
from app.services.historical_backfill import HistoricalBackfillService


class StubEiaProvider:
    def fetch_snapshot(self, *, periods: int):
        assert periods == 500
        return EiaFundamentalsSnapshot(
            source=DataSource(
                id="eia-dnav-weekly-series",
                title="EIA public petroleum weekly DNav series",
                organization="EIA",
                url="https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx",
                retrievedAt="2026-05-19T00:00:00Z",
            ),
            series=[
                FundamentalSeries(
                    id="WCESTUS1",
                    metric=FundamentalMetricKind.inventories,
                    title="U.S. commercial crude inventories excluding SPR",
                    unit="thousand barrels",
                    latestPeriod="2026-05-08",
                    latestValue=420,
                    previousValue=430,
                    periodChange=-10,
                    pricePressure=ImpactDirection.bullish,
                    interpretation="Inventories fell.",
                    observations=[
                        MarketObservation(period="2026-05-01", value=430, unit="thousand barrels"),
                        MarketObservation(period="2026-05-08", value=420, unit="thousand barrels"),
                    ],
                )
            ],
        )


class StubCftcProvider:
    def fetch_snapshot(self, *, periods: int):
        assert periods == 300
        return CftcPositioningSnapshot(
            source=DataSource(
                id="cftc-disaggregated-futures-only",
                title="CFTC Disaggregated Futures Only",
                organization="CFTC",
                url="https://publicreporting.cftc.gov/resource/72hh-3qpy.json",
                retrievedAt="2026-05-19T00:00:00Z",
            ),
            market="WTI-PHYSICAL - NEW YORK MERCANTILE EXCHANGE",
            contractCode="067651",
            latestPeriod="2026-05-08",
            managedMoneyNet=20,
            managedMoneyNetChange=5,
            pricePressure=ImpactDirection.bullish,
            interpretation="Positioning increased.",
            points=[
                FuturesPositioningPoint(
                    period="2026-05-08",
                    openInterest=110,
                    managedMoneyLong=70,
                    managedMoneyShort=50,
                    managedMoneyNet=20,
                    producerMerchantNet=2,
                    swapDealerNet=-2,
                )
            ],
        )


def test_historical_backfill_loads_eia_and_cftc_history(tmp_path: Path) -> None:
    result = HistoricalBackfillService(
        eia_provider=StubEiaProvider(),
        cftc_provider=StubCftcProvider(),
        history_repository=MarketHistoryRepository(tmp_path / "history.sqlite3"),
    ).run(eia_periods=500, cftc_periods=300)

    assert result.eia_series_count == 1
    assert result.eia_observation_count == 2
    assert result.cftc_point_count == 1
    assert result.history.stored_observations == 4
    assert result.history.ingested_observations == 4
    assert not result.warnings
