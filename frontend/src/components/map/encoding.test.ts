import { expect, test } from 'vitest'
import {
  directionClass,
  iconLabelFor,
  markerOpacityFor,
  markerSizeFor,
  selectedEventFor,
} from './encoding'
import { caseStudies } from '../../data/mockCaseStudies'

test('maps market direction to CSS-safe classes', () => {
  expect(directionClass('bullish')).toBe('bullish')
  expect(directionClass('macro')).toBe('macro')
  expect(directionClass('neutral')).toBe('uncertain')
})

test('maps severity and confidence to visual encoding', () => {
  expect(markerSizeFor(0.2)).toBe('small')
  expect(markerSizeFor(0.6)).toBe('medium')
  expect(markerSizeFor(0.9)).toBe('large')
  expect(markerOpacityFor(0.1)).toBe(0.42)
  expect(markerOpacityFor(0.8)).toBe(0.8)
})

test('returns icon labels and selected event', () => {
  expect(iconLabelFor('shipping')).toBe('Shipping')
  expect(selectedEventFor(caseStudies[0].mapEvents, 'reroute-wave')?.title).toBe(
    'Tanker rerouting wave',
  )
  expect(selectedEventFor(caseStudies[0].mapEvents, 'missing')).toBeNull()
})
