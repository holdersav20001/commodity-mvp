import os
import sqlite3
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from statistics import fmean, pstdev

from app.schemas.market_data import (
    HistorySummary,
    MarketObservation,
    OilMarketDataSnapshot,
    SeriesTrendFeature,
    TrendDirection,
)


@dataclass(frozen=True)
class ObservationRecord:
    provider: str
    series_id: str
    metric: str
    title: str
    period: str
    value: float
    unit: str
    source_url: str


class MarketHistoryRepository:
    def __init__(self, database_path: Path | None = None) -> None:
        configured_path = os.getenv("MACROSIGNAL_HISTORY_DB_PATH")
        self.database_path = database_path or (
            Path(configured_path)
            if configured_path
            else Path(__file__).resolve().parents[2] / "data" / "market_history.sqlite3"
        )

    def save_snapshot(self, snapshot: OilMarketDataSnapshot) -> HistorySummary:
        records = self._records_from_snapshot(snapshot)
        if not records:
            self._ensure_schema()
            return HistorySummary(
                databasePath=str(self.database_path),
                storedObservations=self._count_observations(),
                ingestedObservations=0,
                seriesTrends=[],
            )

        self._ensure_schema()
        with self._connect() as connection:
            connection.executemany(
                """
                INSERT INTO market_observations (
                    provider,
                    series_id,
                    metric,
                    title,
                    period,
                    value,
                    unit,
                    source_url,
                    retrieved_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(provider, series_id, period)
                DO UPDATE SET
                    metric = excluded.metric,
                    title = excluded.title,
                    value = excluded.value,
                    unit = excluded.unit,
                    source_url = excluded.source_url,
                    retrieved_at = excluded.retrieved_at
                """,
                [
                    (
                        record.provider,
                        record.series_id,
                        record.metric,
                        record.title,
                        record.period,
                        record.value,
                        record.unit,
                        record.source_url,
                        datetime.now(UTC).isoformat(),
                    )
                    for record in records
                ],
            )

        trends = [
            self._build_trend(record.provider, record.series_id)
            for record in self._unique_series(records)
        ]

        return HistorySummary(
            databasePath=str(self.database_path),
            storedObservations=self._count_observations(),
            ingestedObservations=len(records),
            seriesTrends=[trend for trend in trends if trend is not None],
        )

    def _records_from_snapshot(
        self, snapshot: OilMarketDataSnapshot
    ) -> list[ObservationRecord]:
        records: list[ObservationRecord] = []

        if snapshot.fundamentals:
            provider = snapshot.fundamentals.source.id
            source_url = snapshot.fundamentals.source.url
            for series in snapshot.fundamentals.series:
                records.extend(
                    ObservationRecord(
                        provider=provider,
                        series_id=series.id,
                        metric=series.metric.value,
                        title=series.title,
                        period=observation.period,
                        value=observation.value,
                        unit=observation.unit,
                        source_url=source_url,
                    )
                    for observation in series.observations
                )

        if snapshot.futures_positioning:
            positioning = snapshot.futures_positioning
            records.extend(
                self._cftc_record(
                    metric="managed_money_net",
                    title="CFTC WTI managed money net futures position",
                    period=point.period,
                    value=point.managed_money_net,
                    source_url=positioning.source.url,
                )
                for point in positioning.points
            )
            records.extend(
                self._cftc_record(
                    metric="open_interest",
                    title="CFTC WTI futures open interest",
                    period=point.period,
                    value=point.open_interest,
                    source_url=positioning.source.url,
                )
                for point in positioning.points
            )

        return records

    def _cftc_record(
        self, *, metric: str, title: str, period: str, value: float, source_url: str
    ) -> ObservationRecord:
        return ObservationRecord(
            provider="cftc-cot",
            series_id=f"cftc:{metric}",
            metric=metric,
            title=title,
            period=period,
            value=value,
            unit="contracts",
            source_url=source_url,
        )

    def _build_trend(
        self, provider: str, series_id: str, *, limit: int = 260
    ) -> SeriesTrendFeature | None:
        observations = self._fetch_series(provider, series_id, limit=limit)
        if not observations:
            return None

        values = [observation.value for observation in observations]
        latest = observations[-1]
        previous = observations[-2] if len(observations) >= 2 else None
        weekly_change = latest.value - previous.value if previous else None
        four_period_change = latest.value - values[-5] if len(values) >= 5 else None
        four_period_average = fmean(values[-4:]) if len(values) >= 4 else None
        twelve_period_average = fmean(values[-12:]) if len(values) >= 12 else None
        z_score = self._z_score(values)
        percentile = self._percentile(values)
        trend_direction = self._trend_direction(four_period_change, weekly_change)
        feature_vector = {
            "latest_value": latest.value,
            "sample_count": float(len(values)),
        }
        for key, value in {
            "weekly_change": weekly_change,
            "four_period_change": four_period_change,
            "four_period_average": four_period_average,
            "twelve_period_average": twelve_period_average,
            "z_score": z_score,
            "percentile": percentile,
        }.items():
            if value is not None:
                feature_vector[key] = value

        return SeriesTrendFeature(
            provider=provider,
            seriesId=series_id,
            metric=self._latest_metric(provider, series_id),
            title=self._latest_title(provider, series_id),
            latestPeriod=latest.period,
            sampleCount=len(values),
            latestValue=latest.value,
            weeklyChange=weekly_change,
            fourPeriodChange=four_period_change,
            fourPeriodAverage=four_period_average,
            twelvePeriodAverage=twelve_period_average,
            zScore=z_score,
            percentile=percentile,
            trendDirection=trend_direction,
            mlFeatureVector=feature_vector,
        )

    def _fetch_series(
        self, provider: str, series_id: str, *, limit: int
    ) -> list[MarketObservation]:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT period, value, unit
                FROM market_observations
                WHERE provider = ? AND series_id = ?
                ORDER BY period DESC
                LIMIT ?
                """,
                (provider, series_id, limit),
            ).fetchall()

        return [
            MarketObservation(period=row["period"], value=row["value"], unit=row["unit"])
            for row in reversed(rows)
        ]

    def _latest_metric(self, provider: str, series_id: str) -> str:
        return self._latest_column(provider, series_id, "metric")

    def _latest_title(self, provider: str, series_id: str) -> str:
        return self._latest_column(provider, series_id, "title")

    def _latest_column(self, provider: str, series_id: str, column: str) -> str:
        with self._connect() as connection:
            row = connection.execute(
                f"""
                SELECT {column}
                FROM market_observations
                WHERE provider = ? AND series_id = ?
                ORDER BY period DESC
                LIMIT 1
                """,
                (provider, series_id),
            ).fetchone()
        return str(row[column]) if row else series_id

    def _z_score(self, values: list[float]) -> float | None:
        if len(values) < 2:
            return None
        deviation = pstdev(values)
        if deviation == 0:
            return 0
        return (values[-1] - fmean(values)) / deviation

    def _percentile(self, values: list[float]) -> float | None:
        if len(values) < 2:
            return None
        lower_or_equal_count = sum(1 for value in values if value <= values[-1])
        return (lower_or_equal_count - 1) / (len(values) - 1)

    def _trend_direction(
        self, four_period_change: float | None, weekly_change: float | None
    ) -> TrendDirection:
        change = four_period_change if four_period_change is not None else weekly_change
        if change is None or abs(change) < 1e-9:
            return TrendDirection.flat
        return TrendDirection.rising if change > 0 else TrendDirection.falling

    def _unique_series(self, records: list[ObservationRecord]) -> list[ObservationRecord]:
        seen: set[tuple[str, str]] = set()
        unique: list[ObservationRecord] = []
        for record in records:
            key = (record.provider, record.series_id)
            if key in seen:
                continue
            seen.add(key)
            unique.append(record)
        return unique

    def _ensure_schema(self) -> None:
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS market_observations (
                    provider TEXT NOT NULL,
                    series_id TEXT NOT NULL,
                    metric TEXT NOT NULL,
                    title TEXT NOT NULL,
                    period TEXT NOT NULL,
                    value REAL NOT NULL,
                    unit TEXT NOT NULL,
                    source_url TEXT NOT NULL,
                    retrieved_at TEXT NOT NULL,
                    PRIMARY KEY (provider, series_id, period)
                )
                """
            )
            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_market_observations_series_period
                ON market_observations(provider, series_id, period)
                """
            )

    def _count_observations(self) -> int:
        with self._connect() as connection:
            row = connection.execute("SELECT COUNT(*) AS count FROM market_observations").fetchone()
        return int(row["count"]) if row else 0

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection
