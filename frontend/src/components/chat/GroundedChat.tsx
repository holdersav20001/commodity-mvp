import type { CaseStudy } from '../../data/types'

interface GroundedChatProps {
  activeCase: CaseStudy
}

const suggestedPrompts = [
  'Why is this bullish for Brent?',
  'Which signal has the lowest confidence?',
  'What would invalidate this scenario?',
  'Show only shipping-related drivers.',
]

export function GroundedChat({ activeCase }: GroundedChatProps) {
  return (
    <div className="chat-panel">
      <div>
        <p className="eyebrow">Grounded chat placeholder</p>
        <h2>{activeCase.title}</h2>
        <p>
          Follow-up answers will cite selected case evidence and refuse
          unsupported live-market questions.
        </p>
      </div>
      <div className="prompt-list" aria-label="Suggested prompts">
        {suggestedPrompts.map((prompt) => (
          <button key={prompt} type="button">
            {prompt}
          </button>
        ))}
      </div>
      <label className="chat-input">
        <span>Ask a grounded question</span>
        <input placeholder="Ask about this case study..." />
      </label>
    </div>
  )
}
