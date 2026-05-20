import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, BarChart3, BrainCircuit, Database } from 'lucide-react'
import { fetchOilMarketData } from '../../data/apiClient'
import type {
  CftcPositioningSnapshot,
  FundamentalMetricKind,
  FundamentalSeries,
  OilMarketDataSnapshot,
  SeriesTrendFeature,
} from '../../data/types'

const metricLabels: Record<FundamentalMetricKind, string> = {
  inventories: 'Inventories',
  imports: 'Imports',
  exports: 'Exports',
  production: 'Production',
  refinery_runs: 'Refinery runs',
}

export function MarketDataPanel() {
  const [snapshot, setSnapshot] = useState<OilMarketDataSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    fetchOilMarketData()
      .then((loadedSnapshot) => {
        if (!isMounted) return
        setSnapshot(loadedSnapshot)
        setError(null)
      })
      .catch((loadError: Error) => {
        if (!isMounted) return
        setError(loadError.message)
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="market-data-panel">
        <p className="market-data-status">Loading live market data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="market-data-panel">
        <div className="market-data-warning">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="market-data-panel">
      {snapshot?.warnings.map((warning) => (
        <div className="market-data-warning" key={warning}>
          <AlertTriangle size={16} aria-hidden="true" />
          <span>{warning}</span>
        </div>
      ))}

      <section className="market-data-section" aria-label="EIA physical balances">
        <div className="market-data-heading">
          <Database size={17} aria-hidden="true" />
          <div>
            <h2>EIA physical balances</h2>
            <p>Inventories, flows, production, and refinery demand.</p>
          </div>
        </div>
        {snapshot?.fundamentals ? (
          <div className="fundamental-grid">
            {snapshot.fundamentals.series.map((series) => (
              <FundamentalTile
                key={series.id}
                series={series}
                trend={findTrend(snapshot.history?.seriesTrends, series.id)}
              />
            ))}
          </div>
        ) : (
          <p className="market-data-empty">Live EIA fundamentals are not available right now.</p>
        )}
      </section>

      {snapshot?.history && (
        <section className="market-data-section" aria-label="Stored history and ML features">
          <div className="market-data-heading">
            <BrainCircuit size={17} aria-hidden="true" />
            <div>
              <h2>Stored history and ML features</h2>
              <p>
                {formatNumber(snapshot.history.storedObservations)} observations stored,
                with {formatNumber(snapshot.history.ingestedObservations)} refreshed this run.
              </p>
            </div>
          </div>
          <div className="trend-feature-grid">
            {snapshot.history.seriesTrends.slice(0, 6).map((trend) => (
              <TrendFeatureCard key={`${trend.provider}:${trend.seriesId}`} trend={trend} />
            ))}
          </div>
        </section>
      )}

      <section className="market-data-section" aria-label="CFTC futures positioning">
        <div className="market-data-heading">
          <BarChart3 size={17} aria-hidden="true" />
          <div>
            <h2>CFTC futures positioning</h2>
            <p>Managed money and hedger pressure from official COT data.</p>
          </div>
        </div>
        {snapshot?.futuresPositioning ? (
          <FuturesPositioningCard
            positioning={snapshot.futuresPositioning}
            trend={findTrend(snapshot.history?.seriesTrends, 'cftc:managed_money_net')}
          />
        ) : (
          <p className="market-data-empty">CFTC positioning is not available right now.</p>
        )}
      </section>
    </div>
  )
}

function FundamentalTile({
  series,
  trend,
}: {
  series: FundamentalSeries
  trend?: SeriesTrendFeature
}) {
  return (
    <article className="fundamental-tile">
      <div className="fundamental-title-row">
        <span>{metricLabels[series.metric]}</span>
        <PressureBadge pressure={series.pricePressure} />
      </div>
      <strong>{formatNumber(series.latestValue)}</strong>
      <small>
        {series.unit} - {series.latestPeriod}
      </small>
      {trend && (
        <div className="trend-mini-row">
          <span>{trend.trendDirection}</span>
          <span>z {formatDecimal(trend.zScore)}</span>
          <span>pct {formatPercentile(trend.percentile)}</span>
        </div>
      )}
      <p>{series.interpretation}</p>
    </article>
  )
}

function FuturesPositioningCard({
  positioning,
  trend,
}: {
  positioning: CftcPositioningSnapshot
  trend?: SeriesTrendFeature
}) {
  const latestPoint = positioning.points.at(-1)

  return (
    <article className="futures-positioning-card">
      <div className="futures-summary">
        <div>
          <span>{positioning.market}</span>
          <strong>{formatSigned(positioning.managedMoneyNet)} net</strong>
          <small>Managed money - {positioning.latestPeriod}</small>
        </div>
        <PressureBadge pressure={positioning.pricePressure} />
      </div>
      <p>{positioning.interpretation}</p>
      {latestPoint && (
        <div className="positioning-metrics">
          <Metric label="Open interest" value={formatNumber(latestPoint.openInterest)} />
          <Metric label="Longs" value={formatNumber(latestPoint.managedMoneyLong)} />
          <Metric label="Shorts" value={formatNumber(latestPoint.managedMoneyShort)} />
          <Metric label="Net change" value={formatSigned(positioning.managedMoneyNetChange)} />
          {trend && <Metric label="Trend z-score" value={formatDecimal(trend.zScore)} />}
        </div>
      )}
    </article>
  )
}

function TrendFeatureCard({ trend }: { trend: SeriesTrendFeature }) {
  return (
    <article className="trend-feature-card">
      <div>
        <span>{trend.metric.replaceAll('_', ' ')}</span>
        <strong>{trend.trendDirection}</strong>
      </div>
      <div className="trend-feature-metrics">
        <Metric label="Weekly" value={formatOptionalSigned(trend.weeklyChange)} />
        <Metric label="4-period" value={formatOptionalSigned(trend.fourPeriodChange)} />
        <Metric label="Z-score" value={formatDecimal(trend.zScore)} />
        <Metric label="Percentile" value={formatPercentile(trend.percentile)} />
      </div>
    </article>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="positioning-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function PressureBadge({ pressure }: { pressure: string }) {
  return (
    <span className={`pressure-badge pressure-${pressure}`}>
      <Activity size={13} aria-hidden="true" />
      {pressure}
    </span>
  )
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
}

function formatSigned(value: number): string {
  const formatted = formatNumber(Math.abs(value))
  return value > 0 ? `+${formatted}` : value < 0 ? `-${formatted}` : formatted
}

function formatOptionalSigned(value: number | null): string {
  return value === null ? 'n/a' : formatSigned(value)
}

function formatDecimal(value: number | null): string {
  return value === null
    ? 'n/a'
    : new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(value)
}

function formatPercentile(value: number | null): string {
  if (value === null) return 'n/a'
  return `${Math.round(value * 100)}%`
}

function findTrend(
  trends: SeriesTrendFeature[] | undefined,
  seriesId: string,
): SeriesTrendFeature | undefined {
  return trends?.find((trend) => trend.seriesId === seriesId)
}
