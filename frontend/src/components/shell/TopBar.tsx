import { BarChart3, Bot, RadioTower } from 'lucide-react'
import type { CaseStudy, TimeHorizon } from '../../data/types'
import { PriceChip } from '../common/PriceChip'
import { TimeHorizonToggle } from '../common/TimeHorizonToggle'

interface TopBarProps {
  activeCase: CaseStudy
  caseStudies: CaseStudy[]
  timeHorizon: TimeHorizon
  onCaseChange: (caseStudyId: CaseStudy['id']) => void
  onTimeHorizonChange: (value: TimeHorizon) => void
}

export function TopBar({
  activeCase,
  caseStudies,
  timeHorizon,
  onCaseChange,
  onTimeHorizonChange,
}: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="brand-lockup">
        <span className="brand-lockup__icon" aria-hidden="true">
          <RadioTower size={18} />
        </span>
        <div>
          <p className="eyebrow">Geospatial commodity intelligence</p>
          <h1>MacroSignal Oil</h1>
        </div>
      </div>

      <label className="case-selector">
        <span>Case</span>
        <select
          aria-label="Case study"
          value={activeCase.id}
          onChange={(event) => onCaseChange(event.target.value)}
        >
          {caseStudies.map((caseStudy) => (
            <option key={caseStudy.id} value={caseStudy.id}>
              {caseStudy.title}
            </option>
          ))}
        </select>
      </label>

      <TimeHorizonToggle
        value={timeHorizon}
        onChange={onTimeHorizonChange}
      />

      <div className="price-strip" aria-label="Benchmark price moves">
        {activeCase.priceMoves.map((priceMove) => (
          <PriceChip key={priceMove.benchmark} priceMove={priceMove} />
        ))}
      </div>

      <button className="scenario-button" type="button">
        <BarChart3 size={16} />
        Scenario forecast
      </button>

      <div className="ai-status" aria-label="AI gate status">
        <Bot size={15} />
        Evidence gated
      </div>
    </header>
  )
}
