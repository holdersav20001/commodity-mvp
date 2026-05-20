import {
  Banknote,
  Factory,
  Gauge,
  Leaf,
  Shield,
  Ship,
} from 'lucide-react'

const directions = [
  { label: 'Bullish oil', className: 'legend-dot--bullish' },
  { label: 'Bearish oil', className: 'legend-dot--bearish' },
  { label: 'Mixed', className: 'legend-dot--mixed' },
  { label: 'Macro / indirect', className: 'legend-dot--macro' },
  { label: 'Uncertain', className: 'legend-dot--uncertain' },
]

const impactTypes = [
  { label: 'Geopolitical', Icon: Shield },
  { label: 'Shipping', Icon: Ship },
  { label: 'Production', Icon: Factory },
  { label: 'Macro', Icon: Banknote },
  { label: 'Inventory', Icon: Gauge },
  { label: 'Transition', Icon: Leaf },
]

export function ImpactLegend() {
  return (
    <section className="panel-section">
      <div className="section-heading">
        <span>Impact legend</span>
      </div>

      <div className="legend-grid">
        {directions.map((direction) => (
          <div className="legend-item" key={direction.label}>
            <span className={`legend-dot ${direction.className}`} />
            <span>{direction.label}</span>
          </div>
        ))}
      </div>

      <div className="icon-legend" aria-label="Impact type icons">
        {impactTypes.map(({ label, Icon }) => (
          <div className="legend-item" key={label}>
            <Icon size={15} aria-hidden="true" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
