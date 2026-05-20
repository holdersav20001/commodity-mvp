import { expect, test } from '@playwright/test'

test('loads the MacroSignal Oil app without fatal browser errors', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as Window & { __MACROSIGNAL_DISABLE_WEBGL_MAP__?: boolean })
      .__MACROSIGNAL_DISABLE_WEBGL_MAP__ = true
  })
  const fatalMessages: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error') {
      fatalMessages.push(`[console:${message.type()}] ${message.text()}`)
    }
  })

  page.on('pageerror', (error) => {
    fatalMessages.push(`[pageerror] ${error.message}`)
  })

  const response = await page.goto('/', { waitUntil: 'domcontentloaded' })

  expect(response?.ok(), 'frontend should return a successful document response').toBe(true)
  await expect(page.locator('vite-error-overlay'), 'Vite should not render a fatal error overlay').toHaveCount(0)
  await expect(page.getByText(/MacroSignal Oil/i)).toBeVisible()

  await page.waitForLoadState('networkidle').catch(() => undefined)
  expect(fatalMessages, 'browser console/page errors should stay empty').toEqual([])
})

test('opens route evidence inspector from a map route', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as Window & { __MACROSIGNAL_DISABLE_WEBGL_MAP__?: boolean })
      .__MACROSIGNAL_DISABLE_WEBGL_MAP__ = true
  })
  await page.goto('/', { waitUntil: 'networkidle' })

  await page
    .getByRole('button', { name: 'U.S. Gulf to Europe crude flow' })
    .click()

  await expect(page.getByText('SELECTED ROUTE')).toBeVisible()
  await expect(page.getByText('Alternate Supply', { exact: true })).toBeVisible()
  await expect(page.getByText('Allowed', { exact: true })).toBeVisible()
  await expect(page.getByText('Supporting evidence', { exact: true })).toBeVisible()
  await expect(
    page.getByText(/Europe is a major destination for U\.S\. crude oil exports/i),
  ).toBeVisible()
})

test('shows generated evidence-gated analyst memo', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as Window & { __MACROSIGNAL_DISABLE_WEBGL_MAP__?: boolean })
      .__MACROSIGNAL_DISABLE_WEBGL_MAP__ = true
  })
  await page.goto('/', { waitUntil: 'networkidle' })

  await expect(
    page.getByRole('heading', {
      name: 'Red Sea Shipping Risk: evidence-gated oil-market memo',
    }),
  ).toBeVisible()
  await expect(page.getByText('LLM gate contract')).toBeVisible()
  await expect(page.getByText(/claims allowed in memo/i)).toBeVisible()
  await expect(page.getByText('Blocked from memo', { exact: true })).toBeVisible()
})

test('shows physical balances and futures positioning in market data tab', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as Window & { __MACROSIGNAL_DISABLE_WEBGL_MAP__?: boolean })
      .__MACROSIGNAL_DISABLE_WEBGL_MAP__ = true
  })
  await page.route('http://127.0.0.1:8000/api/market-data/oil', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
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
    })
  })

  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('tab', { name: 'Market Data' }).click()

  await expect(page.getByText('EIA physical balances')).toBeVisible()
  await expect(page.getByText('Inventories', { exact: true })).toBeVisible()
  await expect(page.getByText('Stored history and ML features')).toBeVisible()
  await expect(page.getByText(/3 observations stored/i)).toBeVisible()
  await expect(page.getByText('CFTC futures positioning')).toBeVisible()
  await expect(page.getByText('+72,801 net')).toBeVisible()
})
