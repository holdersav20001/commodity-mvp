import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { TimeHorizonToggle } from './TimeHorizonToggle'

test('selects a time horizon', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()

  render(<TimeHorizonToggle value="weekly" onChange={onChange} />)
  await user.click(screen.getByRole('button', { name: 'monthly' }))

  expect(onChange).toHaveBeenCalledWith('monthly')
})
