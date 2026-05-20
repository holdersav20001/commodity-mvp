import httpx

from app.providers.eia_fundamentals_provider import EiaFundamentalsProvider


def test_eia_provider_uses_public_dnav_when_api_key_is_missing() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.params["s"]
        return httpx.Response(
            200,
            text="""
            <table>
              <tr>
                <td class='B6'>2026-May</td>
                <td class='B5'>05/01&nbsp;</td><td class='B3'>422,000&nbsp;</td>
                <td class='B5'>05/08&nbsp;</td><td class='B3'>420,000&nbsp;</td>
              </tr>
            </table>
            """,
        )

    provider = EiaFundamentalsProvider(
        api_key="",
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )

    snapshot = provider.fetch_snapshot(periods=2)

    assert snapshot.source.id == "eia-dnav-weekly-series"
    inventories = next(series for series in snapshot.series if series.id == "WCESTUS1")
    assert inventories.latest_period == "2026-05-08"
    assert inventories.period_change == -2000
    assert inventories.price_pressure == "bullish"


def test_eia_provider_parses_weekly_fundamental_series() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        series_id = request.url.params["facets[series][]"]
        return httpx.Response(
            200,
            json={
                "response": {
                    "data": [
                        {
                            "period": "2026-05-08",
                            "series": series_id,
                            "value": "420000",
                            "units": "Thousand Barrels",
                        },
                        {
                            "period": "2026-05-01",
                            "series": series_id,
                            "value": "422000",
                            "units": "Thousand Barrels",
                        },
                    ]
                }
            },
        )

    provider = EiaFundamentalsProvider(
        api_key="test-key",
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )

    snapshot = provider.fetch_snapshot(periods=2)

    inventories = next(
        series for series in snapshot.series if series.id == "WCESTUS1"
    )
    assert inventories.latest_period == "2026-05-08"
    assert inventories.period_change == -2000
    assert inventories.price_pressure == "bullish"
    assert inventories.observations[0].period == "2026-05-01"
