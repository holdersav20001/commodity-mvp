from fastapi import APIRouter, Depends, Query

from app.providers.cftc_positioning_provider import (
    CftcDataUnavailableError,
    CftcPositioningProvider,
)
from app.providers.eia_fundamentals_provider import (
    EiaDataUnavailableError,
    EiaFundamentalsProvider,
)
from app.repositories.market_history_repository import MarketHistoryRepository
from app.schemas.market_data import OilMarketDataSnapshot


router = APIRouter(prefix="/market-data", tags=["market-data"])


def get_eia_provider() -> EiaFundamentalsProvider:
    return EiaFundamentalsProvider()


def get_cftc_provider() -> CftcPositioningProvider:
    return CftcPositioningProvider()


def get_history_repository() -> MarketHistoryRepository:
    return MarketHistoryRepository()


@router.get("/oil", response_model=OilMarketDataSnapshot)
def get_oil_market_data(
    eia_periods: int = Query(default=12, ge=2, le=52, alias="eiaPeriods"),
    cftc_periods: int = Query(default=12, ge=2, le=52, alias="cftcPeriods"),
    eia_provider: EiaFundamentalsProvider = Depends(get_eia_provider),
    cftc_provider: CftcPositioningProvider = Depends(get_cftc_provider),
    history_repository: MarketHistoryRepository = Depends(get_history_repository),
) -> OilMarketDataSnapshot:
    warnings: list[str] = []
    fundamentals = None
    futures_positioning = None
    history = None

    try:
        fundamentals = eia_provider.fetch_snapshot(periods=eia_periods)
    except EiaDataUnavailableError as exc:
        warnings.append(str(exc))

    try:
        futures_positioning = cftc_provider.fetch_snapshot(periods=cftc_periods)
    except (CftcDataUnavailableError, Exception) as exc:
        warnings.append(f"CFTC positioning unavailable: {exc}")

    snapshot = OilMarketDataSnapshot(
        fundamentals=fundamentals,
        futuresPositioning=futures_positioning,
        warnings=warnings,
    )
    try:
        history = history_repository.save_snapshot(snapshot)
    except Exception as exc:
        warnings.append(f"Market history unavailable: {exc}")

    return OilMarketDataSnapshot(
        fundamentals=fundamentals,
        futuresPositioning=futures_positioning,
        history=history,
        warnings=warnings,
    )
