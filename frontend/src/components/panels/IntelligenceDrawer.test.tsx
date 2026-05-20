import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { caseStudies } from '../../data/mockCaseStudies'
import { IntelligenceDrawer } from './IntelligenceDrawer'

describe('IntelligenceDrawer', () => {
  it('renders the drawer tabs', () => {
    render(<IntelligenceDrawer activeCase={caseStudies[0]} />)

    expect(screen.getByRole('tab', { name: /analyst memo/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /market data/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /scenario forecast/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /chat/i })).toBeInTheDocument()
  })

  it('switches tab content', async () => {
    const user = userEvent.setup()

    render(<IntelligenceDrawer activeCase={caseStudies[0]} />)
    await user.click(screen.getByRole('tab', { name: /scenario forecast/i }))

    expect(screen.getByText('OPEC policy')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /chat/i }))

    expect(screen.getByText('Ask a grounded question')).toBeInTheDocument()
  })
})
