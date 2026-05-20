import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { caseStudies } from '../../data/mockCaseStudies'
import type { LayerState } from '../../data/types'
import { MapPlaceholder } from './MapPlaceholder'

const layers: LayerState = {
  events: true,
  routes: true,
  chokepoints: true,
  infrastructure: false,
  macroRegions: true,
  transitionSignals: false,
}

test('renders case-driven routes, regions, and hotspots', () => {
  render(
    <MapPlaceholder
      activeCase={caseStudies[0]}
      layers={layers}
      selectedEventId="bab-el-mandeb-alert"
      selectedRouteId={null}
      onSelectEvent={vi.fn()}
      onSelectRoute={vi.fn()}
    />,
  )

  expect(screen.getByText('Security risk')).toBeInTheDocument()
  expect(screen.getByText('Rerouting wave')).toBeInTheDocument()
  expect(screen.getByText('Red Sea risk zone')).toBeInTheDocument()
})

test('selects a hotspot when clicked', async () => {
  const user = userEvent.setup()
  const onSelectEvent = vi.fn()

  render(
    <MapPlaceholder
      activeCase={caseStudies[0]}
      layers={layers}
      selectedEventId={null}
      selectedRouteId={null}
      onSelectEvent={onSelectEvent}
      onSelectRoute={vi.fn()}
    />,
  )

  await user.click(screen.getByRole('button', { name: /rerouting wave/i }))
  expect(onSelectEvent).toHaveBeenCalledWith('reroute-wave')
})

test('selects a route when clicked from the accessible map layer', async () => {
  const user = userEvent.setup()
  const onSelectRoute = vi.fn()

  render(
    <MapPlaceholder
      activeCase={caseStudies[0]}
      layers={layers}
      selectedEventId={null}
      selectedRouteId={null}
      onSelectEvent={vi.fn()}
      onSelectRoute={onSelectRoute}
    />,
  )

  await user.click(
    screen.getByRole('button', { name: /U\.S\. Gulf to Europe crude flow/i }),
  )
  expect(onSelectRoute).toHaveBeenCalledWith('us-gulf-europe-crude-flow')
})
