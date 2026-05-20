import { getConfidenceLabel } from './confidence'

interface ConfidenceBadgeProps {
  value: number
}

export function ConfidenceBadge({ value }: ConfidenceBadgeProps) {
  const normalizedValue = Math.max(0, Math.min(1, value))
  const percent = Math.round(normalizedValue * 100)

  return (
    <div className="confidence-badge">
      <span>{getConfidenceLabel(normalizedValue)}</span>
      <strong>{percent}%</strong>
    </div>
  )
}
