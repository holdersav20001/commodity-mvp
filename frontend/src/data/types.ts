export type TimeHorizon = 'weekly' | 'monthly'

export type ImpactDirection =
  | 'bullish'
  | 'bearish'
  | 'mixed'
  | 'macro'
  | 'neutral'
  | 'uncertain'

export type ImpactType =
  | 'geopolitical'
  | 'shipping'
  | 'supply'
  | 'demand'
  | 'macro'
  | 'inventory'
  | 'transition'

export type PriceMoveTone = 'positive' | 'negative' | 'neutral'

export type Commodity = 'crude_oil' | 'refined_products' | 'natural_gas'

export type RouteKind =
  | 'baseline_flow'
  | 'security_risk'
  | 'reroute'
  | 'alternate_supply'

export type RouteEndpointRole = 'origin' | 'destination' | 'transit' | 'chokepoint'

export type PriceMechanism =
  | 'supply_availability'
  | 'freight_cost'
  | 'insurance_risk'
  | 'security_premium'
  | 'supply_substitution'

export interface PriceMove {
  benchmark: 'Brent' | 'WTI'
  value: string
  tone: PriceMoveTone
  period: string
}

export interface Driver {
  id: string
  title: string
  direction: ImpactDirection
  impact: 'Low' | 'Medium' | 'High'
  detail: string
}

export interface WatchIndicator {
  id: string
  label: string
  status: string
}

export interface TimelineEvent {
  id: string
  date: string
  title: string
  direction: ImpactDirection
  type: ImpactType
}

export interface MapPoint {
  longitude: number
  latitude: number
}

export interface RouteEndpoint {
  id: string
  title: string
  role: RouteEndpointRole
  position: MapPoint
}

export interface MapEvent {
  id: string
  title: string
  label: string
  position: MapPoint
  direction: ImpactDirection
  type: ImpactType
  severity: number
  confidence: number
  description: string
}

export interface MapRoute {
  id: string
  title: string
  description: string
  commodity: Commodity
  routeKind: RouteKind
  origin: RouteEndpoint
  destination: RouteEndpoint
  points: MapPoint[]
  priceMechanisms: PriceMechanism[]
  direction: ImpactDirection
  confidence: number
  evidenceIds: string[]
  active: boolean
}

export interface MapRegion {
  id: string
  title: string
  position: MapPoint
  width: number
  height: number
  direction: ImpactDirection
  severity: number
}

export interface EvidenceItem {
  id: string
  sourceId: string
  claim: string
  excerpt: string
  relevance: number
  supports: string[]
  contradicts: string[]
}

export interface SourceItem {
  id: string
  title: string
  organization: string
  url: string | null
  publishedAt: string
}

export type ClaimGateStatus = 'allowed' | 'blocked' | 'contradicted'

export interface ClaimGate {
  id: string
  targetType: string
  targetId: string
  claim: string
  status: ClaimGateStatus
  allowedInMemo: boolean
  confidence: number
  evidenceIds: string[]
  supportingEvidenceIds: string[]
  contradictingEvidenceIds: string[]
  reason: string
}

export interface MemoCitation {
  evidenceId: string
  sourceId: string
  sourceTitle: string
  organization: string
  excerpt: string
}

export interface MemoDriver {
  targetId: string
  title: string
  direction: ImpactDirection
  confidence: number
  explanation: string
  citationIds: string[]
}

export interface BlockedClaimSummary {
  targetId: string
  status: ClaimGateStatus
  reason: string
}

export interface GeneratedMemo {
  caseId: string
  headline: string
  summary: string
  bullishDrivers: MemoDriver[]
  bearishDrivers: MemoDriver[]
  citations: MemoCitation[]
  blockedClaims: BlockedClaimSummary[]
  confidence: number
}

export type FundamentalMetricKind =
  | 'inventories'
  | 'imports'
  | 'exports'
  | 'production'
  | 'refinery_runs'

export interface DataSource {
  id: string
  title: string
  organization: string
  url: string
  retrievedAt: string
}

export interface MarketObservation {
  period: string
  value: number
  unit: string
}

export interface FundamentalSeries {
  id: string
  metric: FundamentalMetricKind
  title: string
  unit: string
  latestPeriod: string
  latestValue: number
  previousValue: number | null
  periodChange: number | null
  pricePressure: ImpactDirection
  interpretation: string
  observations: MarketObservation[]
}

export interface EiaFundamentalsSnapshot {
  source: DataSource
  series: FundamentalSeries[]
}

export interface FuturesPositioningPoint {
  period: string
  openInterest: number
  managedMoneyLong: number
  managedMoneyShort: number
  managedMoneyNet: number
  producerMerchantNet: number
  swapDealerNet: number
}

export interface CftcPositioningSnapshot {
  source: DataSource
  market: string
  contractCode: string
  latestPeriod: string
  managedMoneyNet: number
  managedMoneyNetChange: number
  pricePressure: ImpactDirection
  interpretation: string
  points: FuturesPositioningPoint[]
}

export type TrendDirection = 'rising' | 'falling' | 'flat'

export interface SeriesTrendFeature {
  provider: string
  seriesId: string
  metric: string
  title: string
  latestPeriod: string
  sampleCount: number
  latestValue: number
  weeklyChange: number | null
  fourPeriodChange: number | null
  fourPeriodAverage: number | null
  twelvePeriodAverage: number | null
  zScore: number | null
  percentile: number | null
  trendDirection: TrendDirection
  mlFeatureVector: Record<string, number>
}

export interface HistorySummary {
  databasePath: string
  storedObservations: number
  ingestedObservations: number
  seriesTrends: SeriesTrendFeature[]
}

export interface OilMarketDataSnapshot {
  fundamentals: EiaFundamentalsSnapshot | null
  futuresPositioning: CftcPositioningSnapshot | null
  history: HistorySummary | null
  warnings: string[]
}

export interface CaseStudy {
  id: string
  title: string
  period: string
  region: string
  summary: string
  primaryImpact: ImpactDirection
  confidence: number
  priceMoves: PriceMove[]
  drivers: Driver[]
  watchIndicators: WatchIndicator[]
  timeline: TimelineEvent[]
  mapEvents: MapEvent[]
  mapRoutes: MapRoute[]
  mapRegions: MapRegion[]
  evidence: EvidenceItem[]
  claimGates: ClaimGate[]
  sources: SourceItem[]
}

export interface LayerState {
  events: boolean
  routes: boolean
  chokepoints: boolean
  infrastructure: boolean
  macroRegions: boolean
  transitionSignals: boolean
}
