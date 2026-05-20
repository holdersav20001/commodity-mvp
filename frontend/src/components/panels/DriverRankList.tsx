import type { Driver } from '../../data/types'

interface DriverRankListProps {
  drivers: Driver[]
}

export function DriverRankList({ drivers }: DriverRankListProps) {
  return (
    <ol className="driver-list">
      {drivers.map((driver, index) => (
        <li className="driver-row" key={driver.id}>
          <span className="driver-rank">{index + 1}</span>
          <div>
            <strong>{driver.title}</strong>
            <p>{driver.detail}</p>
          </div>
          <span className={`impact-pill impact-pill--${driver.direction}`}>
            {driver.impact}
          </span>
        </li>
      ))}
    </ol>
  )
}
