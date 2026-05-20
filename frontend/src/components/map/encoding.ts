import type { ImpactDirection, ImpactType, MapEvent } from '../../data/types'

export function directionClass(direction: ImpactDirection): string {
  if (direction === 'macro') return 'macro'
  if (direction === 'neutral') return 'uncertain'
  return direction
}

export function markerSizeFor(severity: number): 'small' | 'medium' | 'large' {
  if (severity >= 0.75) return 'large'
  if (severity >= 0.45) return 'medium'
  return 'small'
}

export function markerOpacityFor(confidence: number): number {
  return Math.max(0.42, Math.min(1, confidence))
}

export function iconLabelFor(type: ImpactType): string {
  const labels: Record<ImpactType, string> = {
    geopolitical: 'Geopolitical',
    shipping: 'Shipping',
    supply: 'Supply',
    demand: 'Demand',
    macro: 'Macro',
    inventory: 'Inventory',
    transition: 'Transition',
  }

  return labels[type]
}

export function selectedEventFor(
  events: MapEvent[],
  selectedEventId: string | null,
): MapEvent | null {
  if (!selectedEventId) return null
  return events.find((event) => event.id === selectedEventId) ?? null
}
