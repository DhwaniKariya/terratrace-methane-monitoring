import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import '../../styles/Panels.css'

function RiskForecast({ forecasts, riskTrend }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Dynamic Carbon Risk Forecasting</h2>
        <p>Predicted future emission hotspots and risk zones</p>
      </div>

      <div className="chart-card">
        <h3>14-day risk score trend (branch average)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={riskTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={1} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="riskScore" stroke="#4318FF" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {forecasts.length === 0 ? (
        <div className="empty-state">No forecast data for this branch.</div>
      ) : (
        <div className="data-card-list">
          {forecasts.map((f) => (
            <div className="data-card" key={f.forecastId}>
              <div className="data-card-top">
                <div>
                  <span className="data-card-title">{f.forecastId}</span>
                  <span className="data-card-sub"> - {f.assetId} ({f.equipmentType})</span>
                </div>
                <span className={`badge-pill ${f.predictedSeverity.toLowerCase()}`}>{f.predictedSeverity} risk</span>
              </div>

              <div className="field-row">
                <div>
                  <span className="field-label">Asset risk score</span>
                  <span className="field-value">{f.riskScore}/100</span>
                </div>
                <div>
                  <span className="field-label">Leak probability</span>
                  <span className="field-value">{f.leakProbabilityPct}%</span>
                </div>
                <div>
                  <span className="field-label">Predicted emission</span>
                  <span className="field-value">{f.predictedEmissionKgH} kg/hr</span>
                </div>
                <div>
                  <span className="field-label">Forecast window</span>
                  <span className="field-value">{f.forecastPeriod}</span>
                </div>
                <div>
                  <span className="field-label">Wind / temp</span>
                  <span className="field-value">{f.windSpeedKmh} km/h, {f.temperatureC} C</span>
                </div>
                <div>
                  <span className="field-label">Pressure / flow</span>
                  <span className="field-value">{f.pressureBar} bar, {f.flowRateM3h} m3/h</span>
                </div>
                <div>
                  <span className="field-label">Historical pattern</span>
                  <span className="field-value">{f.historicalPatternRef}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RiskForecast
