import { generateRegulatoryScorecard, generateGovernanceMetrics } from '../../data/complianceData'
import { useDecisionsStore } from '../../stores/decisionsStore'
import '../../styles/Panels.css'
import '../../styles/ComplianceGovernance.css'

function statusClass(status) {
  if (status === 'Compliant' || status === 'On Track') return 'good'
  if (status === 'At Risk' || status === 'Behind Target') return 'warn'
  if (status === 'Non-Compliant') return 'bad'
  if (status.startsWith('Level')) {
    const level = parseInt(status.replace('Level ', ''), 10)
    return level >= 4 ? 'info' : 'warn'
  }
  return 'info'
}

function ComplianceGovernance({ branchId }) {
  const statusByRecId = useDecisionsStore((state) => state.statusByRecId)
  const scorecard = generateRegulatoryScorecard(branchId, statusByRecId)
  const governance = generateGovernanceMetrics(branchId, statusByRecId)

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Regulatory &amp; Ethical Compliance</h2>
        <p>Where this branch stands against real reporting frameworks, and how transparently the AI itself is governed</p>
      </div>

      <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#1a202c' }}>Regulatory scorecard</h3>
      <div className="scorecard-grid">
        {scorecard.map((f) => {
          const cls = statusClass(f.status)
          return (
            <div className={`framework-card status-${cls}`} key={f.id}>
              <div className="framework-card-top">
                <span className="framework-name">{f.framework}</span>
                <span className={`badge-pill ${cls}`}>{f.status}</span>
              </div>
              <div className="framework-evidence">{f.evidence}</div>
              <div className="framework-deadline">{f.deadline}</div>
            </div>
          )
        })}
      </div>

      <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#1a202c' }}>AI governance &amp; oversight</h3>
      <div className="kpi-grid">
        <div className={`kpi-card ${governance.humanReviewRatePct >= 80 ? 'status-healthy' : governance.humanReviewRatePct >= 50 ? 'status-warning' : 'status-critical'}`}>
          <span className="kpi-label">Human review rate</span>
          <div className="kpi-value">{governance.humanReviewRatePct}%</div>
          <div className="kpi-sub">{governance.pendingReview} recommendation(s) still awaiting human sign-off</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Avg. detection confidence disclosed</span>
          <div className="kpi-value">{governance.avgConfidencePct}%</div>
          <div className="kpi-sub">shown per-alert, never presented as certainty</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Audit trail completeness</span>
          <div className="kpi-value">{governance.auditTrailCompletePct}%</div>
          <div className="kpi-sub">of verifications have a full evidence chain</div>
        </div>
      </div>

      <div className="data-card" style={{ marginBottom: '1.5rem' }}>
        <div className="data-card-title" style={{ marginBottom: '0.75rem' }}>Data provenance transparency</div>
        <div className="provenance-row">
          {governance.dataProvenance.map((p) => (
            <div className="provenance-item" key={p.source}>
              <span style={{ width: '110px', flexShrink: 0 }}>{p.source}</span>
              <div className="provenance-bar-track"><div className="provenance-bar-fill" style={{ width: `${p.pct}%` }}></div></div>
              <span style={{ width: '40px', textAlign: 'right' }}>{p.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ethics-note">
        <strong>Standing ethical principles behind this tab:</strong>
        <ul>
          <li>No personal data is ever collected - only public satellite imagery of industrial infrastructure.</li>
          <li>No AI recommendation is auto-executed on physical equipment - every action in the Decision Engine requires human Accept/Reject.</li>
          <li>Carbon Exchange credits are permanently retired once used, preventing double-counted climate claims.</li>
          <li>Detection confidence is always shown as a score, never presented as a binary certainty.</li>
        </ul>
      </div>
    </div>
  )
}

export default ComplianceGovernance
