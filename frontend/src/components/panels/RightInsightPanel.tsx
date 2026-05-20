import { Activity, Eye, FileText, ListChecks, Route } from 'lucide-react'
import type { CaseStudy, ClaimGate, MapRoute } from '../../data/types'
import { ConfidenceBadge } from '../common/ConfidenceBadge'
import { DriverRankList } from './DriverRankList'

interface RightInsightPanelProps {
  activeCase: CaseStudy
  selectedEventId: string | null
  selectedRouteId: string | null
}

export function RightInsightPanel({
  activeCase,
  selectedEventId,
  selectedRouteId,
}: RightInsightPanelProps) {
  const selectedEvent =
    activeCase.mapEvents.find((event) => event.id === selectedEventId) ?? null
  const selectedRoute =
    activeCase.mapRoutes.find((route) => route.id === selectedRouteId) ?? null

  return (
    <aside className="side-panel right-panel" aria-label="Market insight panel">
      <section className="panel-section insight-summary">
        <div className="section-heading">
          <span>Active case</span>
          <strong>{activeCase.period}</strong>
        </div>
        <h2>{activeCase.title}</h2>
        <p>{activeCase.summary}</p>
        <ConfidenceBadge value={activeCase.confidence} />
      </section>

      <section className="panel-section">
        <div className="section-heading">
          <span>
            {selectedRoute
              ? 'Selected route'
              : selectedEvent
                ? 'Selected hotspot'
                : 'Ranked drivers'}
          </span>
          {selectedRoute ? (
            <Route size={15} aria-hidden="true" />
          ) : (
            <Activity size={15} aria-hidden="true" />
          )}
        </div>
        {selectedRoute ? (
          <RouteInspector route={selectedRoute} activeCase={activeCase} />
        ) : selectedEvent ? (
          <article className="selected-event-card">
            <span className={`impact-pill impact-pill--${selectedEvent.direction}`}>
              {selectedEvent.direction}
            </span>
            <h3>{selectedEvent.title}</h3>
            <p>{selectedEvent.description}</p>
            <dl>
              <div>
                <dt>Type</dt>
                <dd>{selectedEvent.type}</dd>
              </div>
              <div>
                <dt>Severity</dt>
                <dd>{Math.round(selectedEvent.severity * 100)}%</dd>
              </div>
              <div>
                <dt>Confidence</dt>
                <dd>{Math.round(selectedEvent.confidence * 100)}%</dd>
              </div>
            </dl>
          </article>
        ) : (
          <DriverRankList drivers={activeCase.drivers} />
        )}
      </section>

      {selectedRoute && (
        <section className="panel-section">
          <div className="section-heading">
            <span>Supporting evidence</span>
            <FileText size={15} aria-hidden="true" />
          </div>
          <ul className="evidence-list">
            {activeCase.evidence
              .filter((evidence) => selectedRoute.evidenceIds.includes(evidence.id))
              .map((evidence) => {
                const source = activeCase.sources.find(
                  (item) => item.id === evidence.sourceId,
                )
                return (
                  <li key={evidence.id}>
                    <strong>{evidence.claim}</strong>
                    <p>{evidence.excerpt}</p>
                    <span>
                      {source?.organization ?? 'Unknown source'} ·{' '}
                      {Math.round(evidence.relevance * 100)}% relevance
                    </span>
                  </li>
                )
              })}
          </ul>
        </section>
      )}

      {selectedEvent && !selectedRoute && (
        <section className="panel-section">
          <div className="section-heading">
            <span>Related drivers</span>
            <Activity size={15} aria-hidden="true" />
          </div>
          <DriverRankList drivers={activeCase.drivers} />
        </section>
      )}

      <section className="panel-section">
        <div className="section-heading">
          <span>Watch indicators</span>
          <Eye size={15} aria-hidden="true" />
        </div>
        <ul className="watch-list">
          {activeCase.watchIndicators.map((indicator) => (
            <li key={indicator.id}>
              <ListChecks size={14} aria-hidden="true" />
              <span>{indicator.label}</span>
              <strong>{indicator.status}</strong>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}

function RouteInspector({
  route,
  activeCase,
}: {
  route: MapRoute
  activeCase: CaseStudy
}) {
  const gate = activeCase.claimGates.find(
    (claimGate) => claimGate.targetId === route.id,
  )

  return (
    <article className="selected-event-card selected-route-card">
      <span className={`impact-pill impact-pill--${route.direction}`}>
        {formatRouteKind(route.routeKind)}
      </span>
      <h3>{route.title}</h3>
      <p>{route.description}</p>
      <dl>
        <div>
          <dt>Commodity</dt>
          <dd>{formatToken(route.commodity)}</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>{Math.round(route.confidence * 100)}%</dd>
        </div>
        <div>
          <dt>Evidence</dt>
          <dd>{route.evidenceIds.length}</dd>
        </div>
      </dl>
      <div className="route-flow-summary">
        <strong>{route.origin.title}</strong>
        <span>to</span>
        <strong>{route.destination.title}</strong>
      </div>
      <div className="route-mechanism-list" aria-label="Price mechanisms">
        {route.priceMechanisms.map((mechanism) => (
          <span key={mechanism}>{formatToken(mechanism)}</span>
        ))}
      </div>
      {gate && <GateBadge gate={gate} />}
      <p className="route-evidence-note">
        {activeCase.evidence.filter((evidence) =>
          route.evidenceIds.includes(evidence.id),
        ).length}{' '}
        linked evidence records gate this route before memo generation.
      </p>
    </article>
  )
}

function GateBadge({ gate }: { gate: ClaimGate }) {
  return (
    <div className={`gate-badge gate-badge--${gate.status}`}>
      <strong>{formatToken(gate.status)}</strong>
      <span>{gate.reason}</span>
      <small>{Math.round(gate.confidence * 100)}% gated confidence</small>
    </div>
  )
}

function formatRouteKind(routeKind: MapRoute['routeKind']): string {
  return formatToken(routeKind)
}

function formatToken(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
