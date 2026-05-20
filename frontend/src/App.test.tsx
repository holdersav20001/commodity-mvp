import { render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import App from './App'

afterEach(() => {
  vi.restoreAllMocks()
})

test('renders MacroSignal Oil using fallback case data', async () => {
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('backend unavailable'))

  render(<App />)

  expect(await screen.findByText('MacroSignal Oil')).toBeInTheDocument()
  expect(screen.getByRole('combobox', { name: /case study/i })).toHaveValue(
    'red-sea-shipping-risk',
  )
})
