import os
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from datetime import UTC, datetime
from html.parser import HTMLParser
from typing import Any

import httpx

from app.schemas.case_study import ImpactDirection
from app.schemas.market_data import (
    DataSource,
    EiaFundamentalsSnapshot,
    FundamentalMetricKind,
    FundamentalSeries,
    MarketObservation,
)


class EiaDataUnavailableError(RuntimeError):
    pass


@dataclass(frozen=True)
class EiaSeriesConfig:
    metric: FundamentalMetricKind
    series_id: str
    title: str
    unit: str
    bullish_when_change_positive: bool


DEFAULT_EIA_SERIES: tuple[EiaSeriesConfig, ...] = (
    EiaSeriesConfig(
        metric=FundamentalMetricKind.inventories,
        series_id="WCESTUS1",
        title="U.S. commercial crude inventories excluding SPR",
        unit="thousand barrels",
        bullish_when_change_positive=False,
    ),
    EiaSeriesConfig(
        metric=FundamentalMetricKind.imports,
        series_id="WCRIMUS2",
        title="U.S. crude oil imports",
        unit="thousand barrels per day",
        bullish_when_change_positive=False,
    ),
    EiaSeriesConfig(
        metric=FundamentalMetricKind.exports,
        series_id="WCREXUS2",
        title="U.S. crude oil exports",
        unit="thousand barrels per day",
        bullish_when_change_positive=True,
    ),
    EiaSeriesConfig(
        metric=FundamentalMetricKind.production,
        series_id="WCRFPUS2",
        title="U.S. field production of crude oil",
        unit="thousand barrels per day",
        bullish_when_change_positive=False,
    ),
    EiaSeriesConfig(
        metric=FundamentalMetricKind.refinery_runs,
        series_id="WCRRIUS2",
        title="U.S. crude oil refinery inputs",
        unit="thousand barrels per day",
        bullish_when_change_positive=True,
    ),
)


class EiaFundamentalsProvider:
    base_url = "https://api.eia.gov/v2/petroleum/sum/sndw/data/"
    public_dnav_url = "https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx"

    def __init__(
        self,
        *,
        api_key: str | None = None,
        client: httpx.Client | None = None,
        series: tuple[EiaSeriesConfig, ...] = DEFAULT_EIA_SERIES,
    ) -> None:
        self.api_key = api_key if api_key is not None else os.getenv("EIA_API_KEY")
        self.client = client or httpx.Client(timeout=20)
        self.series = series

    def fetch_snapshot(self, *, periods: int = 12) -> EiaFundamentalsSnapshot:
        uses_api = bool(self.api_key)

        return EiaFundamentalsSnapshot(
            source=DataSource(
                id="eia-api-v2" if uses_api else "eia-dnav-weekly-series",
                title=(
                    "EIA Open Data API v2 petroleum weekly supply and disposition"
                    if uses_api
                    else "EIA public petroleum weekly DNav series"
                ),
                organization="U.S. Energy Information Administration",
                url=self.base_url if uses_api else self.public_dnav_url,
                retrievedAt=datetime.now(UTC).isoformat(),
            ),
            series=self._fetch_all_series(periods=periods, uses_api=uses_api),
        )

    def _fetch_all_series(
        self, *, periods: int, uses_api: bool
    ) -> list[FundamentalSeries]:
        fetcher = self._fetch_series if uses_api else self._fetch_public_dnav_series
        with ThreadPoolExecutor(max_workers=min(len(self.series), 5)) as executor:
            return list(executor.map(lambda config: fetcher(config, periods=periods), self.series))

    def _fetch_series(self, config: EiaSeriesConfig, *, periods: int) -> FundamentalSeries:
        response = self.client.get(
            self.base_url,
            params={
                "api_key": self.api_key,
                "frequency": "weekly",
                "data[0]": "value",
                "facets[series][]": config.series_id,
                "sort[0][column]": "period",
                "sort[0][direction]": "desc",
                "offset": "0",
                "length": str(periods),
            },
        )
        if response.status_code == 403:
            raise EiaDataUnavailableError(
                "EIA rejected the request. Check that EIA_API_KEY is valid and active."
            )
        response.raise_for_status()

        rows = response.json().get("response", {}).get("data", [])
        observations = [
            MarketObservation(
                period=str(row["period"]),
                value=float(row["value"]),
                unit=str(row.get("units") or config.unit),
            )
            for row in rows
            if row.get("value") not in (None, "")
        ]
        if not observations:
            raise EiaDataUnavailableError(f"EIA returned no observations for {config.series_id}.")

        latest = observations[0]
        previous_value = observations[1].value if len(observations) > 1 else None
        period_change = latest.value - previous_value if previous_value is not None else None

        return FundamentalSeries(
            id=config.series_id,
            metric=config.metric,
            title=config.title,
            unit=latest.unit,
            latestPeriod=latest.period,
            latestValue=latest.value,
            previousValue=previous_value,
            periodChange=period_change,
            pricePressure=self._price_pressure(config, period_change),
            interpretation=self._interpret(config, period_change),
            observations=list(reversed(observations)),
        )

    def _fetch_public_dnav_series(
        self, config: EiaSeriesConfig, *, periods: int
    ) -> FundamentalSeries:
        response = self.client.get(
            self.public_dnav_url,
            params={
                "f": "w",
                "n": "pet",
                "s": config.series_id,
            },
        )
        response.raise_for_status()

        parser = EiaDnavWeeklyTableParser()
        parser.feed(response.text)
        observations = [
            MarketObservation(period=period, value=value, unit=config.unit)
            for period, value in parser.observations
        ]
        if not observations:
            raise EiaDataUnavailableError(
                f"EIA public DNav page returned no observations for {config.series_id}."
            )

        observations = observations[-periods:]
        latest = observations[-1]
        previous_value = observations[-2].value if len(observations) > 1 else None
        period_change = latest.value - previous_value if previous_value is not None else None

        return FundamentalSeries(
            id=config.series_id,
            metric=config.metric,
            title=config.title,
            unit=config.unit,
            latestPeriod=latest.period,
            latestValue=latest.value,
            previousValue=previous_value,
            periodChange=period_change,
            pricePressure=self._price_pressure(config, period_change),
            interpretation=self._interpret(config, period_change),
            observations=observations,
        )

    def _price_pressure(
        self, config: EiaSeriesConfig, period_change: float | None
    ) -> ImpactDirection:
        if period_change is None or period_change == 0:
            return ImpactDirection.neutral

        change_is_bullish = (
            period_change > 0
            if config.bullish_when_change_positive
            else period_change < 0
        )
        return ImpactDirection.bullish if change_is_bullish else ImpactDirection.bearish

    def _interpret(self, config: EiaSeriesConfig, period_change: float | None) -> str:
        if period_change is None:
            return "Latest EIA observation loaded; no previous period was available for comparison."

        direction = "rose" if period_change > 0 else "fell" if period_change < 0 else "was unchanged"
        pressure = self._price_pressure(config, period_change)
        return (
            f"{config.title} {direction} by {abs(period_change):,.0f} {config.unit}; "
            f"the model treats that as {pressure.value} oil-price pressure."
        )


class EiaDnavWeeklyTableParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.rows: list[list[str]] = []
        self._current_row: list[str] | None = None
        self._current_cell: list[str] | None = None

    @property
    def observations(self) -> list[tuple[str, float]]:
        parsed: list[tuple[str, float]] = []
        for row in self.rows:
            if not row:
                continue
            year = self._extract_year(row[0])
            if year is None:
                continue
            for index in range(1, len(row) - 1, 2):
                date_text = self._clean(row[index])
                value_text = self._clean(row[index + 1])
                if not date_text or not value_text:
                    continue
                period = self._to_iso_date(year, date_text)
                value = self._to_float(value_text)
                if period is not None and value is not None:
                    parsed.append((period, value))
        return parsed

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "tr":
            self._current_row = []
        elif tag in {"td", "th"} and self._current_row is not None:
            self._current_cell = []

    def handle_data(self, data: str) -> None:
        if self._current_cell is not None:
            self._current_cell.append(data)

    def handle_entityref(self, name: str) -> None:
        if self._current_cell is not None and name == "nbsp":
            self._current_cell.append(" ")

    def handle_endtag(self, tag: str) -> None:
        if tag in {"td", "th"} and self._current_row is not None and self._current_cell is not None:
            self._current_row.append(self._clean("".join(self._current_cell)))
            self._current_cell = None
        elif tag == "tr" and self._current_row is not None:
            if self._current_row:
                self.rows.append(self._current_row)
            self._current_row = None

    def _extract_year(self, text: str) -> int | None:
        cleaned = self._clean(text)
        if len(cleaned) < 4 or not cleaned[:4].isdigit():
            return None
        return int(cleaned[:4])

    def _to_iso_date(self, year: int, date_text: str) -> str | None:
        parts = date_text.split("/")
        if len(parts) != 2:
            return None
        month, day = parts
        if not month.isdigit() or not day.isdigit():
            return None
        return f"{year:04d}-{int(month):02d}-{int(day):02d}"

    def _to_float(self, value_text: str) -> float | None:
        normalized = value_text.replace(",", "").strip()
        if not normalized or normalized in {"--", "-", "NA", "W"}:
            return None
        try:
            return float(normalized)
        except ValueError:
            return None

    def _clean(self, text: str) -> str:
        return " ".join(text.replace("\xa0", " ").split())
