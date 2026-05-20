from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.case_study import ImpactDirection


class FundamentalMetricKind(StrEnum):
    inventories = "inventories"
    imports = "imports"
    exports = "exports"
    production = "production"
    refinery_runs = "refinery_runs"


class DataSource(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    title: str
    organization: str
    url: str
    retrieved_at: str = Field(alias="retrievedAt")


class MarketObservation(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    period: str
    value: float
    unit: str


class FundamentalSeries(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    metric: FundamentalMetricKind
    title: str
    unit: str
    latest_period: str = Field(alias="latestPeriod")
    latest_value: float = Field(alias="latestValue")
    previous_value: float | None = Field(default=None, alias="previousValue")
    period_change: float | None = Field(default=None, alias="periodChange")
    price_pressure: ImpactDirection = Field(alias="pricePressure")
    interpretation: str
    observations: list[MarketObservation]


class EiaFundamentalsSnapshot(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    source: DataSource
    series: list[FundamentalSeries]


class FuturesPositioningPoint(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    period: str
    open_interest: int = Field(alias="openInterest")
    managed_money_long: int = Field(alias="managedMoneyLong")
    managed_money_short: int = Field(alias="managedMoneyShort")
    managed_money_net: int = Field(alias="managedMoneyNet")
    producer_merchant_net: int = Field(alias="producerMerchantNet")
    swap_dealer_net: int = Field(alias="swapDealerNet")


class CftcPositioningSnapshot(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    source: DataSource
    market: str
    contract_code: str = Field(alias="contractCode")
    latest_period: str = Field(alias="latestPeriod")
    managed_money_net: int = Field(alias="managedMoneyNet")
    managed_money_net_change: int = Field(alias="managedMoneyNetChange")
    price_pressure: ImpactDirection = Field(alias="pricePressure")
    interpretation: str
    points: list[FuturesPositioningPoint]


class TrendDirection(StrEnum):
    rising = "rising"
    falling = "falling"
    flat = "flat"


class SeriesTrendFeature(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    provider: str
    series_id: str = Field(alias="seriesId")
    metric: str
    title: str
    latest_period: str = Field(alias="latestPeriod")
    sample_count: int = Field(alias="sampleCount", ge=0)
    latest_value: float = Field(alias="latestValue")
    weekly_change: float | None = Field(default=None, alias="weeklyChange")
    four_period_change: float | None = Field(default=None, alias="fourPeriodChange")
    four_period_average: float | None = Field(default=None, alias="fourPeriodAverage")
    twelve_period_average: float | None = Field(default=None, alias="twelvePeriodAverage")
    z_score: float | None = Field(default=None, alias="zScore")
    percentile: float | None = Field(default=None, ge=0, le=1)
    trend_direction: TrendDirection = Field(alias="trendDirection")
    ml_feature_vector: dict[str, float] = Field(alias="mlFeatureVector")


class HistorySummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    database_path: str = Field(alias="databasePath")
    stored_observations: int = Field(alias="storedObservations", ge=0)
    ingested_observations: int = Field(alias="ingestedObservations", ge=0)
    series_trends: list[SeriesTrendFeature] = Field(alias="seriesTrends")


class HistoricalBackfillResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    history: HistorySummary
    eia_series_count: int = Field(alias="eiaSeriesCount", ge=0)
    eia_observation_count: int = Field(alias="eiaObservationCount", ge=0)
    cftc_point_count: int = Field(alias="cftcPointCount", ge=0)
    warnings: list[str] = Field(default_factory=list)


class OilMarketDataSnapshot(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    fundamentals: EiaFundamentalsSnapshot | None = None
    futures_positioning: CftcPositioningSnapshot | None = Field(
        default=None, alias="futuresPositioning"
    )
    history: HistorySummary | None = None
    warnings: list[str] = Field(default_factory=list)
