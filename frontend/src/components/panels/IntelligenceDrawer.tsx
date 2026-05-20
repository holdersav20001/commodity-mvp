import { useState } from 'react'
import { DatabaseZap, MessageSquareText, Newspaper, SlidersHorizontal } from 'lucide-react'
import type { CaseStudy } from '../../data/types'
import { GroundedChat } from '../chat/GroundedChat'
import { MarketDataPanel } from '../market-data/MarketDataPanel'
import { AnalystMemo } from '../memo/AnalystMemo'
import { ScenarioControls } from '../scenario/ScenarioControls'

interface IntelligenceDrawerProps {
  activeCase: CaseStudy
}

type DrawerTab = 'memo' | 'market-data' | 'scenario' | 'chat'

const tabs: Array<{
  id: DrawerTab
  label: string
  Icon: typeof Newspaper
}> = [
  { id: 'memo', label: 'Analyst Memo', Icon: Newspaper },
  { id: 'market-data', label: 'Market Data', Icon: DatabaseZap },
  { id: 'scenario', label: 'Scenario Forecast', Icon: SlidersHorizontal },
  { id: 'chat', label: 'Chat', Icon: MessageSquareText },
]

export function IntelligenceDrawer({ activeCase }: IntelligenceDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('memo')

  return (
    <section className="intelligence-drawer" aria-label="AI intelligence drawer">
      <div className="drawer-tabs" role="tablist" aria-label="Intelligence tabs">
        {tabs.map(({ id, label, Icon }) => (
          <button
            aria-controls={`drawer-panel-${id}`}
            aria-selected={activeTab === id}
            className="drawer-tab"
            id={`drawer-tab-${id}`}
            key={id}
            onClick={() => setActiveTab(id)}
            role="tab"
            type="button"
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div
        className="drawer-content"
        id={`drawer-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`drawer-tab-${activeTab}`}
      >
        {activeTab === 'memo' && <AnalystMemo activeCase={activeCase} />}
        {activeTab === 'market-data' && <MarketDataPanel />}
        {activeTab === 'scenario' && <ScenarioControls activeCase={activeCase} />}
        {activeTab === 'chat' && <GroundedChat activeCase={activeCase} />}
      </div>
    </section>
  )
}
