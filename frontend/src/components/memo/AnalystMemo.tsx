import { useEffect, useMemo, useState } from 'react'
import { configuredApiBaseUrl, fetchAnalystMemo } from '../../data/apiClient'
import { generateLocalMemo } from '../../data/memoGenerator'
import type { CaseStudy, GeneratedMemo, MemoDriver } from '../../data/types'

interface AnalystMemoProps {
  activeCase: CaseStudy
}

export function AnalystMemo({ activeCase }: AnalystMemoProps) {
  const localMemo = useMemo(() => generateLocalMemo(activeCase), [activeCase])
  const [remoteMemo, setRemoteMemo] = useState<GeneratedMemo | null>(null)
  const memo = remoteMemo ?? localMemo

  useEffect(() => {
    let isMounted = true

    if (!configuredApiBaseUrl) {
      return () => {
        isMounted = false
      }
    }

    fetchAnalystMemo(activeCase.id)
      .then((loadedMemo) => {
        if (isMounted) setRemoteMemo(loadedMemo)
      })
      .catch(() => {
        if (isMounted) setRemoteMemo(null)
      })

    return () => {
      isMounted = false
    }
  }, [activeCase.id])

  return (
    <article className="memo-layout">
      <section className="memo-main">
        <p className="eyebrow">Evidence-gated memo</p>
        <h2>{memo.headline}</h2>
        <p>{memo.summary}</p>

        <MemoDriverList heading="Bullish drivers" drivers={memo.bullishDrivers} />
        <MemoDriverList heading="Bearish / counter drivers" drivers={memo.bearishDrivers} />
      </section>

      <aside className="evidence-preview">
        <strong>LLM gate contract</strong>
        <span>{memo.bullishDrivers.length + memo.bearishDrivers.length} claims allowed in memo</span>
        <span>{memo.blockedClaims.length} claims blocked or flagged</span>
        <span>{Math.round(memo.confidence * 100)}% memo confidence</span>

        {memo.citations.length > 0 && (
          <div className="memo-citation-list">
            {memo.citations.slice(0, 3).map((citation) => (
              <span key={citation.evidenceId}>
                {citation.organization}: {citation.excerpt}
              </span>
            ))}
          </div>
        )}

        {memo.blockedClaims.length > 0 && (
          <div className="blocked-claim-list">
            <strong>Blocked from memo</strong>
            {memo.blockedClaims.slice(0, 3).map((claim) => (
              <span key={claim.targetId}>
                {claim.status}: {claim.reason}
              </span>
            ))}
          </div>
        )}
      </aside>
    </article>
  )
}

function MemoDriverList({
  heading,
  drivers,
}: {
  heading: string
  drivers: MemoDriver[]
}) {
  if (drivers.length === 0) return null

  return (
    <div className="memo-driver-group">
      <h3>{heading}</h3>
      <ul>
        {drivers.slice(0, 3).map((driver) => (
          <li key={driver.targetId}>
            <strong>{driver.title}</strong>
            <p>{driver.explanation}</p>
            <span>{Math.round(driver.confidence * 100)}% gated confidence</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
