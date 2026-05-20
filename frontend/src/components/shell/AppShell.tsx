import { useState } from 'react'
import type { CaseStudy, LayerState, TimeHorizon } from '../../data/types'
import { MapPlaceholder } from '../map/MapPlaceholder'
import { IntelligenceDrawer } from '../panels/IntelligenceDrawer'
import { LeftPanel } from '../panels/LeftPanel'
import { RightInsightPanel } from '../panels/RightInsightPanel'
import { TopBar } from './TopBar'

interface AppShellProps {
  activeCase: CaseStudy
  caseStudies: CaseStudy[]
  timeHorizon: TimeHorizon
  onCaseChange: (caseStudyId: CaseStudy['id']) => void
  onTimeHorizonChange: (value: TimeHorizon) => void
}

const defaultLayers: LayerState = {
  events: true,
  routes: true,
  chokepoints: true,
  infrastructure: false,
  macroRegions: true,
  transitionSignals: false,
}

export function AppShell({
  activeCase,
  caseStudies,
  timeHorizon,
  onCaseChange,
  onTimeHorizonChange,
}: AppShellProps) {
  const [layers, setLayers] = useState<LayerState>(defaultLayers)
  const [requestedEventId, setRequestedEventId] = useState<string | null>(
    activeCase.mapEvents[0]?.id ?? null,
  )
  const [requestedRouteId, setRequestedRouteId] = useState<string | null>(null)
  const selectedRouteId = activeCase.mapRoutes.some(
    (route) => route.id === requestedRouteId,
  )
    ? requestedRouteId
    : null
  const selectedEventId = selectedRouteId
    ? null
    : activeCase.mapEvents.some((event) => event.id === requestedEventId)
    ? requestedEventId
    : (activeCase.mapEvents[0]?.id ?? null)

  const toggleLayer = (layer: keyof LayerState) => {
    setLayers((currentLayers) => ({
      ...currentLayers,
      [layer]: !currentLayers[layer],
    }))
  }

  const selectEvent = (eventId: string) => {
    setRequestedRouteId(null)
    setRequestedEventId(eventId)
  }

  const selectRoute = (routeId: string) => {
    setRequestedEventId(null)
    setRequestedRouteId(routeId)
  }

  return (
    <div className="app-shell">
      <TopBar
        activeCase={activeCase}
        caseStudies={caseStudies}
        timeHorizon={timeHorizon}
        onCaseChange={onCaseChange}
        onTimeHorizonChange={onTimeHorizonChange}
      />
      <main className="dashboard" aria-label="MacroSignal Oil dashboard">
        <LeftPanel
          activeCase={activeCase}
          layers={layers}
          onToggleLayer={toggleLayer}
          selectedEventId={selectedEventId}
          onSelectEvent={selectEvent}
        />
        <MapPlaceholder
          activeCase={activeCase}
          layers={layers}
          selectedEventId={selectedEventId}
          selectedRouteId={selectedRouteId}
          onSelectEvent={selectEvent}
          onSelectRoute={selectRoute}
        />
        <RightInsightPanel
          activeCase={activeCase}
          selectedEventId={selectedEventId}
          selectedRouteId={selectedRouteId}
        />
      </main>
      <IntelligenceDrawer activeCase={activeCase} />
    </div>
  )
}
