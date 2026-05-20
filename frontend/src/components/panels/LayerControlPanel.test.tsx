import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { LayerControlPanel } from './LayerControlPanel'
import type { LayerState } from '../../data/types'

const layers: LayerState = {
  events: true,
  routes: true,
  chokepoints: true,
  infrastructure: false,
  macroRegions: true,
  transitionSignals: false,
}

test('renders layer toggles and toggles a layer', async () => {
  const user = userEvent.setup()
  const onToggleLayer = vi.fn()

  render(<LayerControlPanel layers={layers} onToggleLayer={onToggleLayer} />)
  await user.click(screen.getByLabelText(/shipping routes/i))

  expect(screen.getByText('Event hotspots')).toBeInTheDocument()
  expect(onToggleLayer).toHaveBeenCalledWith('routes')
})
