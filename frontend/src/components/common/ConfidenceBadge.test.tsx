import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ConfidenceBadge } from './ConfidenceBadge'
import { getConfidenceLabel } from './confidence'

describe('ConfidenceBadge', () => {
  it('maps confidence values to labels', () => {
    expect(getConfidenceLabel(0.8)).toBe('High confidence')
    expect(getConfidenceLabel(0.6)).toBe('Medium confidence')
    expect(getConfidenceLabel(0.3)).toBe('Low confidence')
  })

  it('renders a percentage', () => {
    render(<ConfidenceBadge value={0.78} />)

    expect(screen.getByText('High confidence')).toBeInTheDocument()
    expect(screen.getByText('78%')).toBeInTheDocument()
  })
})
