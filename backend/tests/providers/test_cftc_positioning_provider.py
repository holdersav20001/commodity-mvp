import httpx

from app.providers.cftc_positioning_provider import CftcPositioningProvider


def test_cftc_provider_parses_managed_money_positioning() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.params["$where"] == "cftc_contract_market_code='067651'"
        return httpx.Response(
            200,
            json=[
                {
                    "market_and_exchange_names": "WTI-PHYSICAL - NEW YORK MERCANTILE EXCHANGE",
                    "cftc_contract_market_code": "067651",
                    "report_date_as_yyyy_mm_dd": "2026-05-12T00:00:00.000",
                    "open_interest_all": "2081927",
                    "m_money_positions_long_all": "187332",
                    "m_money_positions_short_all": "114531",
                    "change_in_m_money_long_all": "1577",
                    "change_in_m_money_short_all": "-433",
                    "prod_merc_positions_long": "743791",
                    "prod_merc_positions_short": "386384",
                    "swap_positions_long_all": "91319",
                    "swap__positions_short_all": "644860",
                },
                {
                    "market_and_exchange_names": "WTI-PHYSICAL - NEW YORK MERCANTILE EXCHANGE",
                    "cftc_contract_market_code": "067651",
                    "report_date_as_yyyy_mm_dd": "2026-05-05T00:00:00.000",
                    "open_interest_all": "2067827",
                    "m_money_positions_long_all": "185755",
                    "m_money_positions_short_all": "114964",
                    "change_in_m_money_long_all": "-7574",
                    "change_in_m_money_short_all": "1966",
                    "prod_merc_positions_long": "716499",
                    "prod_merc_positions_short": "378998",
                    "swap_positions_long_all": "100020",
                    "swap__positions_short_all": "643671",
                },
            ],
        )

    provider = CftcPositioningProvider(
        client=httpx.Client(transport=httpx.MockTransport(handler))
    )

    snapshot = provider.fetch_snapshot(periods=2)

    assert snapshot.contract_code == "067651"
    assert snapshot.latest_period == "2026-05-12"
    assert snapshot.managed_money_net == 72801
    assert snapshot.managed_money_net_change == 2010
    assert snapshot.price_pressure == "bullish"
    assert snapshot.points[0].period == "2026-05-05"
