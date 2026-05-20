from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class OpecPolicy(StrEnum):
    cuts_deepen = "cuts_deepen"
    cuts_hold = "cuts_hold"
    cuts_unwind = "cuts_unwind"


class ShippingRisk(StrEnum):
    low = "low"
    elevated = "elevated"
    severe = "severe"


class ChinaDemand(StrEnum):
    weak = "weak"
    stable = "stable"
    improving = "improving"


class FedUsd(StrEnum):
    dovish = "dovish"
    neutral = "neutral"
    hawkish = "hawkish"


class Inventories(StrEnum):
    builds = "builds"
    neutral = "neutral"
    draws = "draws"


class TransitionPressure(StrEnum):
    low = "low"
    baseline = "baseline"
    accelerating = "accelerating"


class ForecastHorizon(StrEnum):
    two_to_six_weeks = "2_6_weeks"
    three_to_six_months = "3_6_months"


class ScenarioAssumptions(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    opec_policy: OpecPolicy = Field(alias="opecPolicy")
    shipping_risk: ShippingRisk = Field(alias="shippingRisk")
    china_demand: ChinaDemand = Field(alias="chinaDemand")
    fed_usd: FedUsd = Field(alias="fedUsd")
    inventories: Inventories
    transition_pressure: TransitionPressure = Field(alias="transitionPressure")
    horizon: ForecastHorizon
    user_question: str | None = Field(default=None, alias="userQuestion")
