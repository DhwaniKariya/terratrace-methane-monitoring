import '../../styles/Panels.css'

// Lost-product-value rate derived from our own research brief: UNEP estimates
// ~€31B/yr in lost gas across ~80 million tonnes/yr of O&G methane leaks,
// i.e. roughly €0.39 per kg of CH4 vented.
const LOST_VALUE_PER_KG_EUR = 0.39
const GWP_100 = 30

function assetHealthFromRisk(riskScore) {
  if (riskScore >= 70) return 'Critical'
  if (riskScore >= 40) return 'Warning'
  return 'Healthy'
}

function ExecutiveCommandCenter({ branch, incidents, forecasts, verifications }) {
  const totalCh4KgH = incidents.reduce((sum, i) => sum + i.ch4Rate, 0)
  const totalCh4Tonnes = incidents.reduce((sum, i) => sum + i.leakVolume, 0)
  const totalCo2eT = Math.round(totalCh4Tonnes * GWP_100 * 10) / 10
  const activeEvents = incidents.length
  const hasCritical = incidents.some((i) => i.severity === 'critical')
  const hasHigh = incidents.some((i) => i.severity === 'high')
  const superEmitterStatus = hasCritical ? 'Critical' : hasHigh ? 'High' : 'Normal'
  const avoidedEmissionsT = Math.round(verifications.reduce((sum, v) => sum + v.co2eReductionT, 0) * 10) / 10
  const avgRiskScore = forecasts.length
    ? Math.round(forecasts.reduce((sum, f) => sum + f.riskScore, 0) / forecasts.length)
    : 0
  const assetHealth = assetHealthFromRisk(avgRiskScore)
  const financialImpactPerDay = Math.round(totalCh4KgH * 24 * LOST_VALUE_PER_KG_EUR)

  const statusClass = superEmitterStatus === 'Critical' ? 'status-critical' : superEmitterStatus === 'High' ? 'status-warning' : ''
  const healthClass = assetHealth === 'Critical' ? 'status-critical' : assetHealth === 'Warning' ? 'status-warning' : 'status-healthy'

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Executive Command Center</h2>
        <p>Real-time operational view of methane risk and impact - {branch.name}</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total CH4 emissions</span>
          <div className="kpi-value">{totalCh4KgH.toLocaleString()} kg/hr</div>
          <div className="kpi-sub">{totalCo2eT.toLocaleString()} tCO2e released to date</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Active emission events</span>
          <div className="kpi-value">{activeEvents}</div>
          <div className="kpi-sub">across current filter scope</div>
        </div>

        <div className={`kpi-card ${statusClass}`}>
          <span className="kpi-label">Super-emitter status</span>
          <div className="kpi-value">{superEmitterStatus}</div>
          <div className="kpi-sub">based on active event severity</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Avoided emissions</span>
          <div className="kpi-value">{avoidedEmissionsT.toLocaleString()} tCO2e</div>
          <div className="kpi-sub">from completed interventions</div>
        </div>

        <div className={`kpi-card ${healthClass}`}>
          <span className="kpi-label">Operational risk score</span>
          <div className="kpi-value">{avgRiskScore}/100</div>
          <div className="kpi-sub">AI-generated, from active forecasts</div>
        </div>

        <div className={`kpi-card ${healthClass}`}>
          <span className="kpi-label">Asset health</span>
          <div className="kpi-value">{assetHealth}</div>
          <div className="kpi-sub">derived from risk score</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Financial impact</span>
          <div className="kpi-value">€{financialImpactPerDay.toLocaleString()}/day</div>
          <div className="kpi-sub">estimated lost product value</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Compliance credits used</span>
          <div className="kpi-value">{branch.credits}/100</div>
          <div className="kpi-sub">weekly monitoring allowance</div>
        </div>
      </div>
    </div>
  )
}

export default ExecutiveCommandCenter
