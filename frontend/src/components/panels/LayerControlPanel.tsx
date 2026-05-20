import {
  CircleDot,
  Factory,
  Leaf,
  MapPinned,
  Route,
  ShipWheel,
} from 'lucide-react'
import type { LayerState } from '../../data/types'

interface LayerControlPanelProps {
  layers: LayerState
  onToggleLayer: (layer: keyof LayerState) => void
}

const layerControls: Array<{
  key: keyof LayerState
  label: string
  description: string
  Icon: typeof CircleDot
}> = [
  {
    key: 'events',
    label: 'Event hotspots',
    description: 'Geopolitical, policy, and market-moving event markers',
    Icon: CircleDot,
  },
  {
    key: 'routes',
    label: 'Shipping routes',
    description: 'Trade flows, security-risk corridors, and rerouting paths',
    Icon: Route,
  },
  {
    key: 'chokepoints',
    label: 'Chokepoints',
    description: 'Suez, Hormuz, Bab el-Mandeb, and other bottlenecks',
    Icon: ShipWheel,
  },
  {
    key: 'infrastructure',
    label: 'Infrastructure',
    description: 'Production regions, ports, refineries, and storage hubs',
    Icon: Factory,
  },
  {
    key: 'macroRegions',
    label: 'Macro regions',
    description: 'Policy, demand, currency, and growth signal regions',
    Icon: MapPinned,
  },
  {
    key: 'transitionSignals',
    label: 'Transition signals',
    description: 'EV adoption, renewables, substitution, and long-term pressure',
    Icon: Leaf,
  },
]

const filters = [
  'Bullish',
  'Bearish',
  'Mixed',
  'High confidence',
  'High severity',
  'Short-term',
  'Medium-term',
  'Long-term',
]

export function LayerControlPanel({
  layers,
  onToggleLayer,
}: LayerControlPanelProps) {
  return (
    <section className="panel-section">
      <div className="section-heading">
        <span>Layers</span>
        <strong>{Object.values(layers).filter(Boolean).length} active</strong>
      </div>

      <div className="layer-list">
        {layerControls.map(({ key, label, description, Icon }) => (
          <label className="layer-toggle" key={key}>
            <input
              checked={layers[key]}
              onChange={() => onToggleLayer(key)}
              type="checkbox"
            />
            <Icon size={16} aria-hidden="true" />
            <span>
              <strong>{label}</strong>
              <small>{description}</small>
            </span>
          </label>
        ))}
      </div>

      <div className="filter-chip-group" aria-label="Event filters">
        {filters.map((filter) => (
          <button className="filter-chip" key={filter} type="button">
            {filter}
          </button>
        ))}
      </div>
    </section>
  )
}
