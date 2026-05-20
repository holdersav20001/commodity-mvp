import type {
  CaseStudy,
  ClaimGate,
  GeneratedMemo,
  MemoCitation,
  MemoDriver,
} from './types'

export function generateLocalMemo(activeCase: CaseStudy): GeneratedMemo {
  const allowedGates = activeCase.claimGates.filter((gate) => gate.allowedInMemo)
  const blockedGates = activeCase.claimGates.filter((gate) => !gate.allowedInMemo)
  const citations = buildCitations(activeCase, allowedGates)
  const drivers = allowedGates
    .map((gate) => buildDriver(activeCase, gate, citations))
    .filter((driver): driver is MemoDriver => driver !== null)
  const bullishDrivers = drivers.filter((driver) =>
    ['bullish', 'mixed'].includes(driver.direction),
  )
  const bearishDrivers = drivers.filter((driver) => driver.direction === 'bearish')

  return {
    caseId: activeCase.id,
    headline: `${activeCase.title}: evidence-gated oil-market memo`,
    summary: buildSummary(activeCase, bullishDrivers, bearishDrivers),
    bullishDrivers,
    bearishDrivers,
    citations,
    blockedClaims: blockedGates.map((gate) => ({
      targetId: gate.targetId,
      status: gate.status,
      reason: gate.reason,
    })),
    confidence: memoConfidence(allowedGates),
  }
}

function buildDriver(
  activeCase: CaseStudy,
  gate: ClaimGate,
  citations: MemoCitation[],
): MemoDriver | null {
  const route = activeCase.mapRoutes.find((item) => item.id === gate.targetId)
  const event = activeCase.mapEvents.find((item) => item.id === gate.targetId)
  const driver = activeCase.drivers.find((item) => item.id === gate.targetId)
  const target = route ?? event ?? driver

  if (!target) return null

  const direction = 'direction' in target ? target.direction : 'neutral'
  const explanation =
    'description' in target ? target.description : 'detail' in target ? target.detail : gate.claim

  return {
    targetId: gate.targetId,
    title: target.title,
    direction,
    confidence: gate.confidence,
    explanation,
    citationIds: citations
      .filter((citation) => gate.supportingEvidenceIds.includes(citation.evidenceId))
      .map((citation) => citation.evidenceId),
  }
}

function buildCitations(activeCase: CaseStudy, gates: ClaimGate[]): MemoCitation[] {
  const citationById = new Map<string, MemoCitation>()

  for (const gate of gates) {
    for (const evidenceId of gate.supportingEvidenceIds) {
      if (citationById.has(evidenceId)) continue

      const evidence = activeCase.evidence.find((item) => item.id === evidenceId)
      const source = evidence
        ? activeCase.sources.find((item) => item.id === evidence.sourceId)
        : null

      if (!evidence || !source) continue

      citationById.set(evidence.id, {
        evidenceId: evidence.id,
        sourceId: source.id,
        sourceTitle: source.title,
        organization: source.organization,
        excerpt: evidence.excerpt,
      })
    }
  }

  return [...citationById.values()]
}

function buildSummary(
  activeCase: CaseStudy,
  bullishDrivers: MemoDriver[],
  bearishDrivers: MemoDriver[],
): string {
  const bullishText = driverText(bullishDrivers) || 'no allowed bullish drivers'
  const bearishText = driverText(bearishDrivers) || 'no allowed bearish drivers'
  return `${activeCase.priceMoves[0].benchmark} moved ${activeCase.priceMoves[0].value} over ${activeCase.period}. Allowed evidence highlights ${bullishText}. Counter-pressure from ${bearishText} is separated from blocked or contradicted claims.`
}

function driverText(drivers: MemoDriver[]): string {
  return drivers
    .slice(0, 3)
    .map((driver) => driver.title)
    .join(', ')
}

function memoConfidence(gates: ClaimGate[]): number {
  if (gates.length === 0) return 0
  return gates.reduce((total, gate) => total + gate.confidence, 0) / gates.length
}
