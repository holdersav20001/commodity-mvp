import { Clock3 } from 'lucide-react'
import type { CaseStudy } from '../../data/types'

interface CaseTimelineProps {
  activeCase: CaseStudy
  selectedEventId: string | null
  onSelectEvent: (eventId: string) => void
}

export function CaseTimeline({
  activeCase,
  selectedEventId,
  onSelectEvent,
}: CaseTimelineProps) {
  return (
    <section className="panel-section">
      <div className="section-heading">
        <span>Timeline</span>
        <strong>{activeCase.period}</strong>
      </div>

      <ol className="timeline-list">
        {activeCase.timeline.map((event) => (
          <li
            className={`timeline-item${
              selectedEventId === event.id ? ' timeline-item--selected' : ''
            }`}
            key={event.id}
          >
            <span className={`timeline-marker timeline-marker--${event.direction}`}>
              <Clock3 size={13} aria-hidden="true" />
            </span>
            <div>
              <time>{event.date}</time>
              <button onClick={() => onSelectEvent(event.id)} type="button">
                <strong>{event.title}</strong>
              </button>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
