import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { caseStudies } from '../../data/mockCaseStudies'
import { RightInsightPanel } from './RightInsightPanel'

describe('RightInsightPanel', () => {
  it('renders the active case summary, drivers, confidence, and watch indicators', () => {
    render(
      <RightInsightPanel
        activeCase={caseStudies[0]}
        selectedEventId={caseStudies[0].mapEvents[0].id}
        selectedRouteId={null}
      />,
    )

    expect(screen.getByText('Red Sea Shipping Risk')).toBeInTheDocument()
    expect(screen.getByText('High confidence')).toBeInTheDocument()
    expect(screen.getByText('Security risk rises near Bab el-Mandeb')).toBeInTheDocument()
    expect(screen.getByText('Related drivers')).toBeInTheDocument()
    expect(screen.getByText('Tanker reroutes')).toBeInTheDocument()
  })

  it('renders selected route intelligence and evidence', () => {
    render(
      <RightInsightPanel
        activeCase={caseStudies[0]}
        selectedEventId={null}
        selectedRouteId="us-gulf-europe-crude-flow"
      />,
    )

    expect(screen.getByText('Selected route')).toBeInTheDocument()
    expect(screen.getByText('U.S. Gulf to Europe crude flow')).toBeInTheDocument()
    expect(screen.getByText('Alternate Supply')).toBeInTheDocument()
    expect(screen.getByText('Supporting evidence')).toBeInTheDocument()
    expect(
      screen.getByText(/Europe is a major destination for U\.S\. crude oil exports/i),
    ).toBeInTheDocument()
  })
})
