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
    OilMarketDataSnapshot,
)


def test_market_history_repository_persists_observations_and_trend_features(
    tmp_path: Path,
) -> None:
    repository = MarketHistoryRepository(tmp_path / "history.sqlite3")
    snapshot = OilMarketDataSnapshot(
        fundamentals=EiaFundamentalsSnapshot(
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
                        MarketObservation(period="2026-04-11", value=450, unit="thousand barrels"),
                        MarketObservation(period="2026-04-18", value=440, unit="thousand barrels"),
                        MarketObservation(period="2026-04-25", value=435, unit="thousand barrels"),
                        MarketObservation(period="2026-05-01", value=430, unit="thousand barrels"),
                        MarketObservation(period="2026-05-08", value=420, unit="thousand barrels"),
                    ],
                )
            ],
        ),
        futuresPositioning=CftcPositioningSnapshot(
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
                    period="2026-05-01",
                    openInterest=100,
                    managedMoneyLong=60,
                    managedMoneyShort=45,
                    managedMoneyNet=15,
                    producerMerchantNet=1,
                    swapDealerNet=-1,
                ),
                FuturesPositioningPoint(
                    period="2026-05-08",
                    openInterest=110,
                    managedMoneyLong=70,
                    managedMoneyShort=50,
                    managedMoneyNet=20,
                    producerMerchantNet=2,
                    swapDealerNet=-2,
                ),
            ],
        ),
    )

    history = repository.save_snapshot(snapshot)

    assert history.stored_observations == 9
    assert history.ingested_observations == 9
    inventory_trend = next(
        trend for trend in history.series_trends if trend.series_id == "WCESTUS1"
    )
    assert inventory_trend.sample_count == 5
    assert inventory_trend.weekly_change == -10
    assert inventory_trend.four_period_change == -30
    assert inventory_trend.trend_direction == "falling"
    assert "z_score" in inventory_trend.ml_feature_vector
