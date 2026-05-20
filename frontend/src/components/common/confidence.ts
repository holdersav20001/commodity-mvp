export function getConfidenceLabel(value: number) {
  if (value >= 0.75) {
    return 'High confidence'
  }

  if (value >= 0.55) {
    return 'Medium confidence'
  }

  return 'Low confidence'
}
