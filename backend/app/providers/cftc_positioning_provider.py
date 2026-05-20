from datetime import UTC, datetime
from typing import Any

import httpx

from app.schemas.case_study import ImpactDirection
from app.schemas.market_data import (
    CftcPositioningSnapshot,
    DataSource,
    FuturesPositioningPoint,
)


class CftcDataUnavailableError(RuntimeError):
    pass


class CftcPositioningProvider:
    resource_url = "https://publicreporting.cftc.gov/resource/72hh-3qpy.json"
    wti_contract_code = "067651"

    def __init__(self, *, client: httpx.Client | None = None) -> None:
        self.client = client or httpx.Client(timeout=20)

    def fetch_snapshot(
        self, *, contract_code: str = wti_contract_code, periods: int = 12
    ) -> CftcPositioningSnapshot:
        response = self.client.get(
            self.resource_url,
            params={
                "$select": ",".join(
                    [
                        "market_and_exchange_names",
                        "cftc_contract_market_code",
                        "report_date_as_yyyy_mm_dd",
                        "open_interest_all",
                        "m_money_positions_long_all",
                        "m_money_positions_short_all",
                        "change_in_m_money_long_all",
                        "change_in_m_money_short_all",
                        "prod_merc_positions_long",
                        "prod_merc_positions_short",
                        "swap_positions_long_all",
                        "swap__positions_short_all",
                    ]
                ),
                "$where": f"cftc_contract_market_code='{contract_code}'",
                "$order": "report_date_as_yyyy_mm_dd DESC",
                "$limit": str(periods),
            },
        )
        response.raise_for_status()
        rows = response.json()
        if not rows:
            raise CftcDataUnavailableError(f"CFTC returned no rows for {contract_code}.")

        points = [self._to_point(row) for row in rows]
        latest_row = rows[0]
        latest = points[0]
        latest_change = self._to_int(latest_row, "change_in_m_money_long_all") - self._to_int(
            latest_row, "change_in_m_money_short_all"
        )
        pressure = self._price_pressure(latest_change)

        return CftcPositioningSnapshot(
            source=DataSource(
                id="cftc-disaggregated-futures-only",
                title="CFTC Disaggregated Futures Only Commitments of Traders",
                organization="U.S. Commodity Futures Trading Commission",
                url=self.resource_url,
                retrievedAt=datetime.now(UTC).isoformat(),
            ),
            market=str(latest_row.get("market_and_exchange_names", "WTI crude oil futures")),
            contractCode=contract_code,
            latestPeriod=latest.period,
            managedMoneyNet=latest.managed_money_net,
            managedMoneyNetChange=latest_change,
            pricePressure=pressure,
            interpretation=(
                f"Managed money net positioning changed by {latest_change:+,} contracts; "
                f"the model treats that as {pressure.value} futures-positioning pressure."
            ),
            points=list(reversed(points)),
        )

    def _to_point(self, row: dict[str, Any]) -> FuturesPositioningPoint:
        managed_long = self._to_int(row, "m_money_positions_long_all")
        managed_short = self._to_int(row, "m_money_positions_short_all")
        producer_long = self._to_int(row, "prod_merc_positions_long")
        producer_short = self._to_int(row, "prod_merc_positions_short")
        swap_long = self._to_int(row, "swap_positions_long_all")
        swap_short = self._to_int(row, "swap__positions_short_all")

        return FuturesPositioningPoint(
            period=str(row["report_date_as_yyyy_mm_dd"]).split("T")[0],
            openInterest=self._to_int(row, "open_interest_all"),
            managedMoneyLong=managed_long,
            managedMoneyShort=managed_short,
            managedMoneyNet=managed_long - managed_short,
            producerMerchantNet=producer_long - producer_short,
            swapDealerNet=swap_long - swap_short,
        )

    def _to_int(self, row: dict[str, Any], key: str) -> int:
        value = row.get(key)
        if value in (None, ""):
            return 0
        return int(float(value))

    def _price_pressure(self, managed_money_net_change: int) -> ImpactDirection:
        if managed_money_net_change > 0:
            return ImpactDirection.bullish
        if managed_money_net_change < 0:
            return ImpactDirection.bearish
        return ImpactDirection.neutral
