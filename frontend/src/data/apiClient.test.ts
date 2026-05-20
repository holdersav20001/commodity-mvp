import { afterEach, expect, test, vi } from 'vitest'
import { fetchAnalystMemo, fetchCaseStudies } from './apiClient'

afterEach(() => {
  vi.restoreAllMocks()
})

test('loads generated analyst memo from the backend API', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        caseId: 'api-case',
        headline: 'API memo',
        summary: 'Evidence-gated summary',
        bullishDrivers: [],
        bearishDrivers: [],
        citations: [],
        blockedClaims: [],
        confidence: 0.8,
      }),
      { status: 200 },
    ),
  )

  const memo = await fetchAnalystMemo('api-case')

  expect(memo).toMatchObject({
    caseId: 'api-case',
    headline: 'API memo',
    confidence: 0.8,
  })
})

test('loads and normalizes case studies from the backend API', async () => {
  vi.spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            id: 'api-case',
            title: 'API Case',
            summary: 'Loaded from API',
            period: { label: 'API period' },
            primaryBenchmark: 'brent',
          },
        ]),
        { status: 200 },
      ),
    )
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 'api-case',
          title: 'API Case',
          summary: 'Loaded from API',
          period: { label: 'API period' },
          primaryBenchmark: 'brent',
          priceMove: {
            brent: { percentChange: 1.2 },
            wti: { percentChange: -0.4 },
          },
          events: [
            {
              id: 'event-1',
              title: 'API Event',
              description: 'API event detail',
              coordinates: { longitude: 43.3, latitude: 12.6 },
              impactDirection: 'bullish',
              impactType: 'shipping',
              severity: 0.82,
              confidence: 0.8,
            },
          ],
          routes: [
            {
              id: 'route-1',
              title: 'API Route',
              description: 'API route detail',
              commodity: 'crude_oil',
              routeKind: 'alternate_supply',
              origin: {
                id: 'origin-1',
                title: 'API Origin',
                role: 'origin',
                coordinates: { longitude: -95, latitude: 28 },
              },
              destination: {
                id: 'dest-1',
                title: 'API Destination',
                role: 'destination',
                coordinates: { longitude: 4, latitude: 52 },
              },
              coordinates: [
                { longitude: -95, latitude: 28 },
                { longitude: -40, latitude: 44 },
                { longitude: 4, latitude: 52 },
              ],
              priceMechanisms: ['supply_substitution'],
              impactDirection: 'bullish',
              impactType: 'supply',
              severity: 0.55,
              confidence: 0.76,
              evidenceIds: ['ev-1'],
            },
          ],
          regions: [
            {
              id: 'region-1',
              title: 'API Region',
              center: { longitude: 43.3, latitude: 12.6 },
              impactDirection: 'bullish',
              severity: 0.8,
            },
          ],
          indicators: [
            {
              id: 'driver-1',
              title: 'API Driver',
              description: 'Driver detail',
              impactDirection: 'bullish',
              severity: 0.8,
            },
          ],
          watchIndicators: [
            {
              id: 'watch-1',
              title: 'API Watch',
              description: 'Elevated',
            },
          ],
          evidence: [
            {
              id: 'ev-1',
              sourceId: 'source-1',
              claim: 'API route is evidence-backed.',
              excerpt: 'Evidence excerpt.',
              relevance: 0.8,
              supports: ['route-1'],
            },
          ],
          claimGates: [
            {
              id: 'gate-route-1',
              targetType: 'route',
              targetId: 'route-1',
              claim: 'API route detail',
              status: 'allowed',
              allowedInMemo: true,
              confidence: 0.78,
              evidenceIds: ['ev-1'],
              supportingEvidenceIds: ['ev-1'],
              contradictingEvidenceIds: [],
              reason: 'Claim is supported by linked evidence.',
            },
          ],
          sources: [
            {
              id: 'source-1',
              title: 'API Source',
              organization: 'MacroSignal',
              url: null,
              publishedAt: '2024-01-01',
            },
          ],
        }),
        { status: 200 },
      ),
    )

  const cases = await fetchCaseStudies()

  expect(cases).toHaveLength(1)
  expect(cases[0]).toMatchObject({
    id: 'api-case',
    title: 'API Case',
    priceMoves: [
      { benchmark: 'Brent', value: '+1.2%', tone: 'positive' },
      { benchmark: 'WTI', value: '-0.4%', tone: 'negative' },
    ],
    timeline: [{ id: 'event-1', title: 'API Event' }],
    mapRoutes: [{ id: 'route-1', routeKind: 'alternate_supply' }],
    evidence: [{ id: 'ev-1', sourceId: 'source-1' }],
    claimGates: [{ targetId: 'route-1', status: 'allowed' }],
  })
})
