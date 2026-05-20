import { expect, test } from 'vitest'
import { caseStudies } from './mockCaseStudies'
import { generateLocalMemo } from './memoGenerator'

test('generates a memo from allowed claim gates', () => {
  const memo = generateLocalMemo(caseStudies[0])

  expect(memo.headline).toBe('Red Sea Shipping Risk: evidence-gated oil-market memo')
  expect(memo.bullishDrivers.length).toBeGreaterThan(0)
  expect(memo.citations.length).toBeGreaterThan(0)
})

test('keeps blocked claims out of memo driver sections', () => {
  const memo = generateLocalMemo(caseStudies[0])
  const driverTargetIds = [
    ...memo.bullishDrivers.map((driver) => driver.targetId),
    ...memo.bearishDrivers.map((driver) => driver.targetId),
  ]

  expect(memo.blockedClaims.map((claim) => claim.targetId)).toContain('usd-counter')
  expect(driverTargetIds).not.toContain('usd-counter')
})
