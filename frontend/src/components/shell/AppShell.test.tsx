import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { caseStudies } from '../../data/mockCaseStudies'
import { AppShell } from './AppShell'

describe('AppShell', () => {
  it('renders the command-center regions', () => {
    render(
      <AppShell
        activeCase={caseStudies[0]}
        caseStudies={caseStudies}
        timeHorizon="weekly"
        onCaseChange={vi.fn()}
        onTimeHorizonChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(
      screen.getByRole('main', { name: 'MacroSignal Oil dashboard' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Map controls')).toBeInTheDocument()
    expect(screen.getByLabelText('Global oil intelligence map')).toBeInTheDocument()
    expect(screen.getByLabelText('Market insight panel')).toBeInTheDocument()
    expect(screen.getByLabelText('AI intelligence drawer')).toBeInTheDocument()
  })
})
