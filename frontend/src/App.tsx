import { useEffect, useState } from 'react'
import { AppShell } from './components/shell/AppShell'
import { caseStudies } from './data/mockCaseStudies'
import { configuredApiBaseUrl, fetchCaseStudies } from './data/apiClient'
import type { CaseStudy, TimeHorizon } from './data/types'
import './App.css'

function App() {
  const [availableCases, setAvailableCases] = useState<CaseStudy[]>(caseStudies)
  const [activeCaseId, setActiveCaseId] = useState(caseStudies[0].id)
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('weekly')

  useEffect(() => {
    let isMounted = true

    if (!configuredApiBaseUrl) {
      return () => {
        isMounted = false
      }
    }

    fetchCaseStudies()
      .then((loadedCases) => {
        if (!isMounted || loadedCases.length === 0) return
        setAvailableCases(loadedCases)
        setActiveCaseId((currentId) =>
          loadedCases.some((caseStudy) => caseStudy.id === currentId)
            ? currentId
            : loadedCases[0].id,
        )
      })
      .catch(() => {
        if (isMounted) {
          setAvailableCases(caseStudies)
          setActiveCaseId((currentId) =>
            caseStudies.some((caseStudy) => caseStudy.id === currentId)
              ? currentId
              : caseStudies[0].id,
          )
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const activeCase =
    availableCases.find((caseStudy) => caseStudy.id === activeCaseId) ??
    availableCases[0]

  const handleCaseChange = (caseStudyId: CaseStudy['id']) => {
    setActiveCaseId(caseStudyId)
  }

  return (
    <AppShell
      activeCase={activeCase}
      caseStudies={availableCases}
      timeHorizon={timeHorizon}
      onCaseChange={handleCaseChange}
      onTimeHorizonChange={setTimeHorizon}
    />
  )
}

export default App
