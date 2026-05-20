import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ImpactLegend } from './ImpactLegend'

describe('ImpactLegend', () => {
  it('contains impact colors and type labels', () => {
    render(<ImpactLegend />)

    expect(screen.getByText('Bullish oil')).toBeInTheDocument()
    expect(screen.getByText('Bearish oil')).toBeInTheDocument()
    expect(screen.getByText('Mixed')).toBeInTheDocument()
    expect(screen.getByText('Macro / indirect')).toBeInTheDocument()
    expect(screen.getByText('Geopolitical')).toBeInTheDocument()
    expect(screen.getByText('Shipping')).toBeInTheDocument()
    expect(screen.getByText('Transition')).toBeInTheDocument()
  })
})
