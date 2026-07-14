import { useDecisionsStore } from '../../stores/decisionsStore'
import '../../styles/Panels.css'

function DecisionEngine({ recommendations }) {
  const statusByRecId = useDecisionsStore((state) => state.statusByRecId)
  const setStatus = useDecisionsStore((state) => state.setStatus)

  if (!recommendations.length) {
    return (
      <div className="panel">
        <div className="panel-header">
          <h2>Operational Decision Engine</h2>
          <p>Recommended actions - pressure adjustments, isolation steps, operational settings</p>
        </div>
        <div className="empty-state">No active recommendations for this branch.</div>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Operational Decision Engine</h2>
        <p>Recommended actions - pressure adjustments, isolation steps, operational settings</p>
      </div>

      <div className="data-card-list">
        {recommendations.map((rec) => {
          const status = statusByRecId[rec.recommendationId] || rec.status
          return (
            <div className="data-card" key={rec.recommendationId}>
              <div className="data-card-top">
                <div>
                  <span className="data-card-title">{rec.recommendationId}</span>
                  <span className="data-card-sub"> - {rec.assetId}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`badge-pill ${rec.priority.toLowerCase()}`}>{rec.priority}</span>
                  <span className={`badge-pill ${status.toLowerCase()}`}>{status}</span>
                </div>
              </div>

              <div className="field-row">
                <div>
                  <span className="field-label">Root cause</span>
                  <span className="field-value">{rec.rootCause}</span>
                </div>
                <div>
                  <span className="field-label">Suggested action</span>
                  <span className="field-value">{rec.suggestedAction}</span>
                </div>
                <div>
                  <span className="field-label">Expected reduction</span>
                  <span className="field-value">{rec.expectedReductionKgH} kg CH4/hr</span>
                </div>
                <div>
                  <span className="field-label">Downtime estimate</span>
                  <span className="field-value">{rec.downtimeEstimateHours}h</span>
                </div>
                <div>
                  <span className="field-label">AI confidence</span>
                  <span className="field-value">{rec.confidencePct}%</span>
                </div>
                <div>
                  <span className="field-label">Responsible team</span>
                  <span className="field-value">{rec.responsibleTeam}</span>
                </div>
                <div>
                  <span className="field-label">Estimated cost</span>
                  <span className="field-value">€{rec.estimatedCostEUR.toLocaleString()}</span>
                </div>
              </div>

              <div className="status-actions" style={{ marginTop: '0.85rem' }}>
                <button className="accept" onClick={() => setStatus(rec.recommendationId, 'Accepted')}>Accept</button>
                <button className="reject" onClick={() => setStatus(rec.recommendationId, 'Rejected')}>Reject</button>
                <button onClick={() => setStatus(rec.recommendationId, 'Pending')}>Reset</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DecisionEngine
