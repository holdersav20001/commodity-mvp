import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { caseStudies } from '../../data/mockCaseStudies'
import { TopBar } from './TopBar'

describe('TopBar', () => {
  it('renders the product controls and price chips', () => {
    render(
      <TopBar
        activeCase={caseStudies[0]}
        caseStudies={caseStudies}
        timeHorizon="weekly"
        onCaseChange={vi.fn()}
        onTimeHorizonChange={vi.fn()}
      />,
    )

    expect(screen.getByText('MacroSignal Oil')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Case study' })).toHaveValue(
      'red-sea-shipping-risk',
    )
    expect(screen.getByText('Brent')).toBeInTheDocument()
    expect(screen.getByText('WTI')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /scenario forecast/i }),
    ).toBeInTheDocument()
  })

  it('calls onCaseChange when the case selector changes', async () => {
    const user = userEvent.setup()
    const onCaseChange = vi.fn()

    render(
      <TopBar
        activeCase={caseStudies[0]}
        caseStudies={caseStudies}
        timeHorizon="weekly"
        onCaseChange={onCaseChange}
        onTimeHorizonChange={vi.fn()}
      />,
    )

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Case study' }),
      'opec-supply-discipline',
    )

    expect(onCaseChange).toHaveBeenCalledWith('opec-supply-discipline')
  })
})
