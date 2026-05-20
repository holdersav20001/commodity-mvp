import type { TimeHorizon } from '../../data/types'

interface TimeHorizonToggleProps {
  value: TimeHorizon
  onChange: (value: TimeHorizon) => void
}

const options: TimeHorizon[] = ['weekly', 'monthly']

export function TimeHorizonToggle({
  value,
  onChange,
}: TimeHorizonToggleProps) {
  return (
    <div className="segmented-control" aria-label="Time horizon">
      {options.map((option) => (
        <button
          aria-pressed={value === option}
          className="segmented-control__button"
          key={option}
          onClick={() => onChange(option)}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  )
}
