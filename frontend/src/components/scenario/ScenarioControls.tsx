import type { CaseStudy } from '../../data/types'

interface ScenarioControlsProps {
  activeCase: CaseStudy
}

const controls = [
  ['OPEC policy', 'Cuts hold'],
  ['Shipping risk', 'Elevated'],
  ['China demand', 'Stable'],
  ['Fed / USD', 'Neutral'],
  ['Inventories', 'Draws'],
  ['Transition pressure', 'Baseline'],
]

export function ScenarioControls({ activeCase }: ScenarioControlsProps) {
  return (
    <div className="scenario-panel">
      <div>
        <p className="eyebrow">Scenario forecast placeholder</p>
        <h2>{activeCase.title}</h2>
        <p>
          Directional forecasts will be conditional on these assumptions and
          labeled separately from experimental range estimates.
        </p>
      </div>
      <div className="scenario-control-grid">
        {controls.map(([label, value]) => (
          <label key={label}>
            <span>{label}</span>
            <select defaultValue={value}>
              <option>{value}</option>
            </select>
          </label>
        ))}
      </div>
    </div>
  )
}
