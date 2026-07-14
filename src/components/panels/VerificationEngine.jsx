import { format } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import '../../styles/Panels.css'

function VerificationEngine({ verifications }) {
  if (!verifications.length) {
    return (
      <div className="panel">
        <div className="panel-header">
          <h2>Avoided Emissions Verification Engine</h2>
          <p>Quantify and certify prevented emissions</p>
        </div>
        <div className="empty-state">No completed interventions to verify for this branch yet.</div>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Avoided Emissions Verification Engine</h2>
        <p>Quantify and certify prevented emissions</p>
      </div>

      <div className="data-card-list">
        {verifications.map((v) => {
          const chartData = [
            { name: 'Baseline', kgH: v.baselineKgH },
            { name: 'Post-action', kgH: v.postActionKgH },
          ]
          return (
            <div className="data-card" key={v.verificationId}>
              <div className="data-card-top">
                <div>
                  <span className="data-card-title">{v.verificationId}</span>
                  <span className="data-card-sub"> - {v.assetId} - {v.interventionType}</span>
                </div>
                <span className={`badge-pill ${v.carbonCreditEligible ? 'accepted' : 'pending'}`}>
                  {v.carbonCreditEligible ? 'Credit eligible' : 'Not yet eligible'}
                </span>
              </div>

              <div className="field-row" style={{ marginBottom: '0.75rem' }}>
                <div>
                  <span className="field-label">Intervention date</span>
                  <span className="field-value">{format(new Date(v.interventionDate), 'dd MMM yyyy')}</span>
                </div>
                <div>
                  <span className="field-label">Avoided emissions</span>
                  <span className="field-value">{v.avoidedKgH} kg CH4/hr</span>
                </div>
                <div>
                  <span className="field-label">CO2e reduction</span>
                  <span className="field-value">{v.co2eReductionT} tCO2e</span>
                </div>
                <div>
                  <span className="field-label">Verification confidence</span>
                  <span className="field-value">{v.verificationConfidencePct}%</span>
                </div>
                <div>
                  <span className="field-label">Evidence source</span>
                  <span className="field-value">{v.evidenceSource}</span>
                </div>
                <div>
                  <span className="field-label">ESG category</span>
                  <span className="field-value">{v.esgCategory}</span>
                </div>
                <div>
                  <span className="field-label">Insurance risk reduction</span>
                  <span className="field-value">{v.insuranceRiskReductionPct}%</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={90}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="kgH" fill="#4318FF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <ul className="audit-trail">
                {v.auditTrail.map((entry, i) => (
                  <li key={i}>{entry}</li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default VerificationEngine
