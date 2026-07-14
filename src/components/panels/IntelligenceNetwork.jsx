import { IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react'
import { industryBenchmarks } from '../../data/networkData'
import '../../styles/Panels.css'

const TREND_ICON = {
  increasing: <IconTrendingUp size={16} />,
  decreasing: <IconTrendingDown size={16} />,
  stable: <IconMinus size={16} />,
}

function IntelligenceNetwork() {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Industry-wide Methane Intelligence Network</h2>
        <p>Anonymized cross-company patterns, aggregated across contributing operators</p>
      </div>

      <div className="data-card-list">
        {industryBenchmarks.map((b) => {
          const aboveBenchmark = b.avgEmissionIntensityKgH > b.industryBenchmarkKgH
          return (
            <div className="data-card" key={b.clusterId}>
              <div className="data-card-top">
                <div>
                  <span className="data-card-title">{b.equipmentCategory}</span>
                  <span className="data-card-sub"> - {b.region} - {b.clusterId}</span>
                </div>
                <span className={`badge-pill ${aboveBenchmark ? 'critical' : 'accepted'}`}>
                  {aboveBenchmark ? 'Above industry benchmark' : 'At/below benchmark'}
                </span>
              </div>

              <div className="field-row">
                <div>
                  <span className="field-label">Failure frequency</span>
                  <span className="field-value">{b.failureFrequency} incidents/yr</span>
                </div>
                <div>
                  <span className="field-label">Avg emission intensity</span>
                  <span className="field-value">{b.avgEmissionIntensityKgH} kg/hr</span>
                </div>
                <div>
                  <span className="field-label">Industry benchmark</span>
                  <span className="field-value">{b.industryBenchmarkKgH} kg/hr</span>
                </div>
                <div>
                  <span className="field-label">Equipment risk index</span>
                  <span className="field-value">{b.equipmentRiskIndex}/100</span>
                </div>
                <div>
                  <span className="field-label">Trend</span>
                  <span className={`field-value trend-arrow ${b.trendEvolution}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    {TREND_ICON[b.trendEvolution]} {b.trendEvolution}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default IntelligenceNetwork
