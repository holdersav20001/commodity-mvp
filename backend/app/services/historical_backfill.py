import httpx

from app.providers.cftc_positioning_provider import (
    CftcDataUnavailableError,
    CftcPositioningProvider,
)
from app.providers.eia_fundamentals_provider import (
    EiaDataUnavailableError,
    EiaFundamentalsProvider,
)
from app.repositories.market_history_repository import MarketHistoryRepository
from app.schemas.market_data import HistoricalBackfillResult, OilMarketDataSnapshot


class HistoricalBackfillService:
    def __init__(
        self,
        *,
        eia_provider: EiaFundamentalsProvider | None = None,
        cftc_provider: CftcPositioningProvider | None = None,
        history_repository: MarketHistoryRepository | None = None,
    ) -> None:
        self.eia_provider = eia_provider or EiaFundamentalsProvider(
            client=httpx.Client(timeout=60)
        )
        self.cftc_provider = cftc_provider or CftcPositioningProvider(
            client=httpx.Client(timeout=60)
        )
        self.history_repository = history_repository or MarketHistoryRepository()

    def run(
        self, *, eia_periods: int = 100_000, cftc_periods: int = 10_000
    ) -> HistoricalBackfillResult:
        warnings: list[str] = []
        fundamentals = None
        futures_positioning = None

        try:
            fundamentals = self.eia_provider.fetch_snapshot(periods=eia_periods)
        except EiaDataUnavailableError as exc:
            warnings.append(str(exc))

        try:
            futures_positioning = self.cftc_provider.fetch_snapshot(periods=cftc_periods)
        except CftcDataUnavailableError as exc:
            warnings.append(str(exc))

        snapshot = OilMarketDataSnapshot(
            fundamentals=fundamentals,
            futuresPositioning=futures_positioning,
            warnings=warnings,
        )
        history = self.history_repository.save_snapshot(snapshot)

        return HistoricalBackfillResult(
            history=history,
            eiaSeriesCount=len(fundamentals.series) if fundamentals else 0,
            eiaObservationCount=sum(len(series.observations) for series in fundamentals.series)
            if fundamentals
            else 0,
            cftcPointCount=len(futures_positioning.points) if futures_positioning else 0,
            warnings=warnings,
        )
