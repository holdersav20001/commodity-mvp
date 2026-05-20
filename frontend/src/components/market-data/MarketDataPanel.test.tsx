import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MarketDataPanel } from './MarketDataPanel'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('MarketDataPanel', () => {
  it('renders EIA fundamentals and CFTC futures positioning', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          fundamentals: {
            source: {
              id: 'eia',
              title: 'EIA',
              organization: 'EIA',
              url: 'https://api.eia.gov',
              retrievedAt: '2026-05-19T00:00:00Z',
            },
            series: [
              {
                id: 'WCESTUS1',
                metric: 'inventories',
                title: 'U.S. commercial crude inventories excluding SPR',
                unit: 'thousand barrels',
                latestPeriod: '2026-05-08',
                latestValue: 420000,
                previousValue: 422000,
                periodChange: -2000,
                pricePressure: 'bullish',
                interpretation: 'Inventories fell by 2,000 thousand barrels.',
                observations: [],
              },
            ],
          },
          futuresPositioning: {
            source: {
              id: 'cftc',
              title: 'CFTC',
              organization: 'CFTC',
              url: 'https://publicreporting.cftc.gov/resource/72hh-3qpy.json',
              retrievedAt: '2026-05-19T00:00:00Z',
            },
            market: 'WTI-PHYSICAL - NEW YORK MERCANTILE EXCHANGE',
            contractCode: '067651',
            latestPeriod: '2026-05-12',
            managedMoneyNet: 72801,
            managedMoneyNetChange: 2010,
            pricePressure: 'bullish',
            interpretation: 'Managed money net positioning changed by +2,010 contracts.',
            points: [
              {
                period: '2026-05-12',
                openInterest: 2081927,
                managedMoneyLong: 187332,
                managedMoneyShort: 114531,
                managedMoneyNet: 72801,
                producerMerchantNet: 357407,
                swapDealerNet: -553541,
              },
            ],
          },
          history: {
            databasePath: 'backend/data/market_history.sqlite3',
            storedObservations: 3,
            ingestedObservations: 3,
            seriesTrends: [
              {
                provider: 'eia-dnav-weekly-series',
                seriesId: 'WCESTUS1',
                metric: 'inventories',
                title: 'U.S. commercial crude inventories excluding SPR',
                latestPeriod: '2026-05-08',
                sampleCount: 5,
                latestValue: 420000,
                weeklyChange: -2000,
                fourPeriodChange: -6000,
                fourPeriodAverage: 421500,
                twelvePeriodAverage: null,
                zScore: -1.2,
                percentile: 0,
                trendDirection: 'falling',
                mlFeatureVector: {
                  latest_value: 420000,
                  weekly_change: -2000,
                  z_score: -1.2,
                },
              },
              {
                provider: 'cftc-cot',
                seriesId: 'cftc:managed_money_net',
                metric: 'managed_money_net',
                title: 'CFTC WTI managed money net futures position',
                latestPeriod: '2026-05-12',
                sampleCount: 5,
                latestValue: 72801,
                weeklyChange: 2010,
                fourPeriodChange: 3000,
                fourPeriodAverage: 70000,
                twelvePeriodAverage: null,
                zScore: 0.8,
                percentile: 0.75,
                trendDirection: 'rising',
                mlFeatureVector: {
                  latest_value: 72801,
                  weekly_change: 2010,
                  z_score: 0.8,
                },
              },
            ],
          },
          warnings: [],
        }),
        { status: 200 },
      ),
    )

    render(<MarketDataPanel />)

    await waitFor(() => {
      expect(screen.getByText('EIA physical balances')).toBeInTheDocument()
    })
    expect(screen.getByText('Inventories')).toBeInTheDocument()
    expect(screen.getByText('CFTC futures positioning')).toBeInTheDocument()
    expect(screen.getByText('Stored history and ML features')).toBeInTheDocument()
    expect(screen.getByText(/3 observations stored/i)).toBeInTheDocument()
    expect(screen.getByText('+72,801 net')).toBeInTheDocument()
  })

  it('explains when EIA is waiting for an API key', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          fundamentals: null,
          futuresPositioning: null,
          history: null,
          warnings: ['EIA_API_KEY is required'],
        }),
        { status: 200 },
      ),
    )

    render(<MarketDataPanel />)

    expect(await screen.findByText('EIA_API_KEY is required')).toBeInTheDocument()
    expect(screen.getByText(/Live EIA fundamentals are not available/i)).toBeInTheDocument()
  })
})
