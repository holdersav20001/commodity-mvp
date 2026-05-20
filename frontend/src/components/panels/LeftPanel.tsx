import type { CaseStudy, LayerState } from '../../data/types'
import { CaseTimeline } from './CaseTimeline'
import { ImpactLegend } from './ImpactLegend'
import { LayerControlPanel } from './LayerControlPanel'

interface LeftPanelProps {
  activeCase: CaseStudy
  layers: LayerState
  onToggleLayer: (layer: keyof LayerState) => void
  selectedEventId: string | null
  onSelectEvent: (eventId: string) => void
}

export function LeftPanel({
  activeCase,
  layers,
  onToggleLayer,
  selectedEventId,
  onSelectEvent,
}: LeftPanelProps) {
  return (
    <aside className="side-panel left-panel" aria-label="Map controls">
      <LayerControlPanel layers={layers} onToggleLayer={onToggleLayer} />
      <ImpactLegend />
      <CaseTimeline
        activeCase={activeCase}
        selectedEventId={selectedEventId}
        onSelectEvent={onSelectEvent}
      />
    </aside>
  )
}
