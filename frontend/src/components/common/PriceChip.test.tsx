import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { PriceChip } from './PriceChip'

test('renders benchmark and price move', () => {
  render(
    <PriceChip
      priceMove={{
        benchmark: 'Brent',
        value: '+2.8%',
        tone: 'positive',
        period: 'weekly',
      }}
    />,
  )

  expect(screen.getByText('Brent')).toBeInTheDocument()
  expect(screen.getByText('+2.8%')).toBeInTheDocument()
})
