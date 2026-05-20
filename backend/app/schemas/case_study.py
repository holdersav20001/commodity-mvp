from enum import StrEnum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.evidence_gate import ClaimGateResult
from app.schemas.scenario import ScenarioAssumptions


Score = Annotated[float, Field(ge=0, le=1)]


class Benchmark(StrEnum):
    brent = "brent"
    wti = "wti"


class ImpactDirection(StrEnum):
    bullish = "bullish"
    bearish = "bearish"
    mixed = "mixed"
    neutral = "neutral"
    uncertain = "uncertain"


class ImpactType(StrEnum):
    geopolitical = "geopolitical"
    shipping = "shipping"
    supply = "supply"
    demand = "demand"
    macro = "macro"
    inventory = "inventory"
    transition = "transition"


class TimeHorizon(StrEnum):
    short = "short"
    medium = "medium"
    long = "long"


class Commodity(StrEnum):
    crude_oil = "crude_oil"
    refined_products = "refined_products"
    natural_gas = "natural_gas"


class RouteKind(StrEnum):
    baseline_flow = "baseline_flow"
    security_risk = "security_risk"
    reroute = "reroute"
    alternate_supply = "alternate_supply"


class RouteEndpointRole(StrEnum):
    origin = "origin"
    destination = "destination"
    transit = "transit"
    chokepoint = "chokepoint"


class PriceMechanism(StrEnum):
    supply_availability = "supply_availability"
    freight_cost = "freight_cost"
    insurance_risk = "insurance_risk"
    security_premium = "security_premium"
    supply_substitution = "supply_substitution"


class Period(BaseModel):
    start: str
    end: str
    label: str


class BenchmarkMove(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    start_price: float = Field(alias="startPrice")
    end_price: float = Field(alias="endPrice")
    percent_change: float = Field(alias="percentChange")
    unit: str


class PriceMove(BaseModel):
    brent: BenchmarkMove
    wti: BenchmarkMove


class Coordinates(BaseModel):
    longitude: float
    latitude: float

    @field_validator("longitude")
    @classmethod
    def longitude_must_be_valid(cls, value: float) -> float:
        if value < -180 or value > 180:
            raise ValueError("longitude must be between -180 and 180")
        return value

    @field_validator("latitude")
    @classmethod
    def latitude_must_be_valid(cls, value: float) -> float:
        if value < -90 or value > 90:
            raise ValueError("latitude must be between -90 and 90")
        return value


class MapFocus(BaseModel):
    center: Coordinates
    zoom: float = Field(ge=0, le=20)


class RouteEndpoint(BaseModel):
    id: str
    title: str
    role: RouteEndpointRole
    coordinates: Coordinates


class Source(BaseModel):
    id: str
    title: str
    organization: str
    url: str | None = None
    published_at: str = Field(alias="publishedAt")


class Evidence(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    source_id: str = Field(alias="sourceId")
    claim: str
    excerpt: str
    relevance: Score
    supports: list[str]
    contradicts: list[str] = Field(default_factory=list)


class MarketEvent(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    title: str
    description: str
    location_name: str = Field(alias="locationName")
    coordinates: Coordinates
    impact_direction: ImpactDirection = Field(alias="impactDirection")
    impact_type: ImpactType = Field(alias="impactType")
    severity: Score
    confidence: Score
    time_horizon: TimeHorizon = Field(alias="timeHorizon")
    affected_benchmarks: list[Benchmark] = Field(alias="affectedBenchmarks", min_length=1)
    evidence_ids: list[str] = Field(alias="evidenceIds", min_length=1)
    related_event_ids: list[str] = Field(default_factory=list, alias="relatedEventIds")


class RouteSignal(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    title: str
    description: str
    commodity: Commodity
    route_kind: RouteKind = Field(alias="routeKind")
    origin: RouteEndpoint
    destination: RouteEndpoint
    coordinates: list[Coordinates] = Field(min_length=2)
    price_mechanisms: list[PriceMechanism] = Field(alias="priceMechanisms", min_length=1)
    impact_direction: ImpactDirection = Field(alias="impactDirection")
    impact_type: ImpactType = Field(alias="impactType")
    severity: Score
    confidence: Score
    evidence_ids: list[str] = Field(alias="evidenceIds", min_length=1)


class RegionSignal(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    title: str
    description: str
    center: Coordinates
    radius_km: float = Field(alias="radiusKm", gt=0)
    impact_direction: ImpactDirection = Field(alias="impactDirection")
    impact_type: ImpactType = Field(alias="impactType")
    severity: Score
    confidence: Score
    evidence_ids: list[str] = Field(alias="evidenceIds", min_length=1)


class IndicatorSignal(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    title: str
    description: str
    impact_direction: ImpactDirection = Field(alias="impactDirection")
    impact_type: ImpactType = Field(alias="impactType")
    severity: Score
    confidence: Score
    evidence_ids: list[str] = Field(alias="evidenceIds", min_length=1)


class CounterSignal(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    title: str
    description: str
    impact_direction: ImpactDirection = Field(alias="impactDirection")
    evidence_ids: list[str] = Field(alias="evidenceIds", min_length=1)


class WatchIndicator(BaseModel):
    id: str
    title: str
    description: str


class ScenarioTemplate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    title: str
    assumptions: ScenarioAssumptions
    historical_analogues: list[str] = Field(alias="historicalAnalogues", min_length=1)
    invalidating_signals: list[str] = Field(alias="invalidatingSignals", min_length=1)


class CaseStudySummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    title: str
    summary: str
    period: Period
    primary_benchmark: Benchmark = Field(alias="primaryBenchmark")


class CaseStudy(CaseStudySummary):
    model_config = ConfigDict(populate_by_name=True)

    price_move: PriceMove = Field(alias="priceMove")
    map_focus: MapFocus = Field(alias="mapFocus")
    events: list[MarketEvent] = Field(min_length=1)
    routes: list[RouteSignal] = Field(default_factory=list)
    regions: list[RegionSignal] = Field(default_factory=list)
    indicators: list[IndicatorSignal] = Field(default_factory=list)
    evidence: list[Evidence] = Field(min_length=1)
    claim_gates: list[ClaimGateResult] = Field(default_factory=list, alias="claimGates")
    sources: list[Source] = Field(min_length=1)
    counter_signals: list[CounterSignal] = Field(alias="counterSignals", min_length=1)
    watch_indicators: list[WatchIndicator] = Field(alias="watchIndicators", min_length=1)
    scenarios: list[ScenarioTemplate] = Field(min_length=1)
