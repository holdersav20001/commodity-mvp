import type { PriceMove } from '../../data/types'

interface PriceChipProps {
  priceMove: PriceMove
}

export function PriceChip({ priceMove }: PriceChipProps) {
  return (
    <div className={`price-chip price-chip--${priceMove.tone}`}>
      <span className="price-chip__benchmark">{priceMove.benchmark}</span>
      <span className="price-chip__value">{priceMove.value}</span>
      <span className="sr-only">over the selected {priceMove.period} period</span>
    </div>
  )
}
