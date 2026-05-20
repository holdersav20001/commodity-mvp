import type { CaseStudy, GeneratedMemo, OilMarketDataSnapshot } from './types'

export const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL as
  | string
  | undefined

const fallbackApiBaseUrl = 'http://127.0.0.1:8000/api'

interface BackendCaseSummary {
  id: string
  title: string
  summary: string
  period: {
    label: string
  }
  primaryBenchmark: 'brent' | 'wti'
}

interface BackendCaseStudy extends BackendCaseSummary {
  priceMove: {
    brent: { percentChange: number }
    wti: { percentChange: number }
  }
  events: Array<{
    id: string
    title: string
    description: string
    coordinates: {
      longitude: number
      latitude: number
    }
    impactDirection: CaseStudy['primaryImpact']
    impactType: CaseStudy['timeline'][number]['type']
    severity: number
    confidence: number
  }>
  routes: Array<{
    id: string
    title: string
    description: string
    commodity: CaseStudy['mapRoutes'][number]['commodity']
    routeKind: CaseStudy['mapRoutes'][number]['routeKind']
    origin: {
      id: string
      title: string
      role: CaseStudy['mapRoutes'][number]['origin']['role']
      coordinates: {
        longitude: number
        latitude: number
      }
    }
    destination: {
      id: string
      title: string
      role: CaseStudy['mapRoutes'][number]['destination']['role']
      coordinates: {
        longitude: number
        latitude: number
      }
    }
    coordinates: Array<{
      longitude: number
      latitude: number
    }>
    priceMechanisms: CaseStudy['mapRoutes'][number]['priceMechanisms']
    impactDirection: CaseStudy['primaryImpact']
    impactType: CaseStudy['timeline'][number]['type']
    severity: number
    confidence: number
    evidenceIds: string[]
  }>
  regions: Array<{
    id: string
    title: string
    center: {
      longitude: number
      latitude: number
    }
    impactDirection: CaseStudy['primaryImpact']
    severity: number
  }>
  indicators: Array<{
    id: string
    title: string
    description: string
    impactDirection: CaseStudy['drivers'][number]['direction']
    severity: number
  }>
  watchIndicators: Array<{
    id: string
    title: string
    description: string
  }>
  evidence: Array<{
    id: string
    sourceId: string
    claim: string
    excerpt: string
    relevance: number
    supports: string[]
    contradicts?: string[]
  }>
  claimGates: CaseStudy['claimGates']
  sources: Array<{
    id: string
    title: string
    organization: string
    url: string | null
    publishedAt: string
  }>
}

export async function fetchCaseStudies(): Promise<CaseStudy[]> {
  const apiBaseUrl = configuredApiBaseUrl ?? fallbackApiBaseUrl
  const response = await fetch(`${apiBaseUrl}/cases`)

  if (!response.ok) {
    throw new Error(`Failed to load case studies: ${response.status}`)
  }

  const summaries = (await response.json()) as BackendCaseSummary[]
  const cases = await Promise.all(
    summaries.map((summary) => fetchCaseStudy(summary.id)),
  )

  return cases
}

export async function fetchCaseStudy(caseStudyId: string): Promise<CaseStudy> {
  const apiBaseUrl = configuredApiBaseUrl ?? fallbackApiBaseUrl
  const response = await fetch(`${apiBaseUrl}/cases/${caseStudyId}`)

  if (!response.ok) {
    throw new Error(`Failed to load case study ${caseStudyId}: ${response.status}`)
  }

  return normalizeCaseStudy((await response.json()) as BackendCaseStudy)
}

export async function fetchAnalystMemo(caseStudyId: string): Promise<GeneratedMemo> {
  const apiBaseUrl = configuredApiBaseUrl ?? fallbackApiBaseUrl
  const response = await fetch(`${apiBaseUrl}/cases/${caseStudyId}/memo`)

  if (!response.ok) {
    throw new Error(`Failed to load memo for ${caseStudyId}: ${response.status}`)
  }

  return (await response.json()) as GeneratedMemo
}

export async function fetchOilMarketData(): Promise<OilMarketDataSnapshot> {
  const apiBaseUrl = configuredApiBaseUrl ?? fallbackApiBaseUrl
  const response = await fetch(`${apiBaseUrl}/market-data/oil`)

  if (!response.ok) {
    throw new Error(`Failed to load oil market data: ${response.status}`)
  }

  return (await response.json()) as OilMarketDataSnapshot
}

function normalizeCaseStudy(caseStudy: BackendCaseStudy): CaseStudy {
  const confidence =
    caseStudy.events.reduce((total, event) => total + event.confidence, 0) /
    Math.max(caseStudy.events.length, 1)

  return {
    id: caseStudy.id,
    title: caseStudy.title,
    period: caseStudy.period.label,
    region: caseStudy.primaryBenchmark === 'brent' ? 'Global seaborne crude' : 'U.S. crude market',
    summary: caseStudy.summary,
    primaryImpact: caseStudy.events[0]?.impactDirection ?? 'uncertain',
    confidence,
    priceMoves: [
      {
        benchmark: 'Brent',
        value: formatPercent(caseStudy.priceMove.brent.percentChange),
        tone: toneFor(caseStudy.priceMove.brent.percentChange),
        period: 'weekly',
      },
      {
        benchmark: 'WTI',
        value: formatPercent(caseStudy.priceMove.wti.percentChange),
        tone: toneFor(caseStudy.priceMove.wti.percentChange),
        period: 'weekly',
      },
    ],
    drivers: caseStudy.indicators.map((indicator) => ({
      id: indicator.id,
      title: indicator.title,
      direction: indicator.impactDirection,
      impact: indicator.severity >= 0.75 ? 'High' : indicator.severity >= 0.45 ? 'Medium' : 'Low',
      detail: indicator.description,
    })),
    watchIndicators: caseStudy.watchIndicators.map((indicator) => ({
      id: indicator.id,
      label: indicator.title,
      status: indicator.description,
    })),
    timeline: caseStudy.events.map((event, index) => ({
      id: event.id,
      date: `T+${index + 1}`,
      title: event.title,
      direction: event.impactDirection,
      type: event.impactType,
    })),
    mapEvents: [
      ...caseStudy.events.map((event) => ({
        id: event.id,
        title: event.title,
        label: compactLabel(event.title),
        position: {
          longitude: event.coordinates.longitude,
          latitude: event.coordinates.latitude,
        },
        direction: event.impactDirection,
        type: event.impactType,
        severity: event.severity,
        confidence: event.confidence,
        description: event.description,
      })),
      ...routeEndpointEvents(caseStudy),
    ],
    mapRoutes: caseStudy.routes.map((route) => ({
      id: route.id,
      title: route.title,
      description: route.description,
      commodity: route.commodity,
      routeKind: route.routeKind,
      origin: {
        id: route.origin.id,
        title: route.origin.title,
        role: route.origin.role,
        position: {
          longitude: route.origin.coordinates.longitude,
          latitude: route.origin.coordinates.latitude,
        },
      },
      destination: {
        id: route.destination.id,
        title: route.destination.title,
        role: route.destination.role,
        position: {
          longitude: route.destination.coordinates.longitude,
          latitude: route.destination.coordinates.latitude,
        },
      },
      points: route.coordinates.map((point) => ({
        longitude: point.longitude,
        latitude: point.latitude,
      })),
      priceMechanisms: route.priceMechanisms,
      direction: route.impactDirection,
      confidence: route.confidence,
      evidenceIds: route.evidenceIds,
      active: true,
    })),
    mapRegions: caseStudy.regions.map((region) => ({
      id: region.id,
      title: region.title,
      position: {
        longitude: region.center.longitude,
        latitude: region.center.latitude,
      },
      width: 18,
      height: 16,
      direction: region.impactDirection,
      severity: region.severity,
    })),
    evidence: caseStudy.evidence.map((evidence) => ({
      id: evidence.id,
      sourceId: evidence.sourceId,
      claim: evidence.claim,
      excerpt: evidence.excerpt,
      relevance: evidence.relevance,
      supports: evidence.supports,
      contradicts: evidence.contradicts ?? [],
    })),
    claimGates: caseStudy.claimGates ?? [],
    sources: caseStudy.sources,
  }
}

function routeEndpointEvents(caseStudy: BackendCaseStudy): CaseStudy['mapEvents'] {
  const endpoints = new Map<string, CaseStudy['mapEvents'][number]>()

  for (const route of caseStudy.routes) {
    for (const endpoint of [route.origin, route.destination]) {
      if (endpoints.has(endpoint.id)) continue

      endpoints.set(endpoint.id, {
        id: endpoint.id,
        title: endpoint.title,
        label: `${endpoint.role === 'origin' ? 'Origin' : 'Destination'}: ${compactLabel(endpoint.title)}`,
        position: {
          longitude: endpoint.coordinates.longitude,
          latitude: endpoint.coordinates.latitude,
        },
        direction: endpoint.role === 'origin' ? route.impactDirection : 'neutral',
        type: endpoint.role === 'origin' ? route.impactType : 'demand',
        severity: route.severity,
        confidence: route.confidence,
        description: route.description,
      })
    }
  }

  return [...endpoints.values()]
}

function compactLabel(title: string): string {
  return title.split(' ').slice(0, 3).join(' ')
}

function formatPercent(value: number): string {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(1)}%`
}

function toneFor(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}
