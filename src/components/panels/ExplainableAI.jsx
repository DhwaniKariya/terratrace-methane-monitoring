import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { generateIncidents } from '../../data/mockData'
import {
  generateModelPerformance,
  generateFeatureAttribution,
  generateReliabilityCurve,
  generateConfusionSummary,
  MODEL_CARD,
} from '../../data/exAiData'
import { useDecisionsStore } from '../../stores/decisionsStore'
import '../../styles/Panels.css'
import '../../styles/ExplainableAI.css'

function ExplainableAI({ branchId }) {
  const statusByRecId = useDecisionsStore((state) => state.statusByRecId)
  const incidents = generateIncidents(branchId)
  const [selectedId, setSelectedId] = useState(incidents[0]?.id)
  const selected = incidents.find((i) => i.id === selectedId) || incidents[0]

  const perf = generateModelPerformance(branchId)
  const reliability = generateReliabilityCurve(branchId, statusByRecId)
  const confusion = generateConfusionSummary(branchId, statusByRecId)
  const attribution = selected ? generateFeatureAttribution(selected) : null

  const benchmarkData = [
    { metric: 'Detection rate', TerraTrace: perf.ourDetectionRatePct, Industry: perf.benchmark.overallDetectionRatePct },
    { metric: 'Quantification accuracy', TerraTrace: perf.ourQuantificationAccuracyPct, Industry: perf.benchmark.quantificationWithin50PctRatePct },
  ]
  const fpData = [
    { metric: 'False positive rate', TerraTrace: perf.ourFalsePositiveRatePct, Industry: perf.benchmark.falsePositiveRatePct },
  ]

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Ex-AI — Model Explainability</h2>
        <p>Why the model flagged what it flagged, and how that compares to independently validated satellite methane detectors</p>
      </div>

      <div className="kpi-grid">
        <div className={`kpi-card ${perf.ourDetectionRatePct >= perf.benchmark.overallDetectionRatePct ? 'status-healthy' : 'status-warning'}`}>
          <span className="kpi-label">Detection rate (this branch)</span>
          <div className="kpi-value">{perf.ourDetectionRatePct}%</div>
          <div className="kpi-sub">vs. {perf.benchmark.overallDetectionRatePct}% independent field-trial baseline</div>
        </div>
        <div className={`kpi-card ${perf.ourFalsePositiveRatePct <= perf.benchmark.falsePositiveRatePct + 2 ? 'status-healthy' : 'status-warning'}`}>
          <span className="kpi-label">Estimated false positive rate</span>
          <div className="kpi-value">{perf.ourFalsePositiveRatePct}%</div>
          <div className="kpi-sub">weighted by evidence tier mix (E1/E2/E3)</div>
        </div>
        <div className={`kpi-card ${perf.ourQuantificationAccuracyPct >= perf.benchmark.quantificationWithin50PctRatePct ? 'status-healthy' : 'status-warning'}`}>
          <span className="kpi-label">Quantification accuracy</span>
          <div className="kpi-value">{perf.ourQuantificationAccuracyPct}%</div>
          <div className="kpi-sub">avg. verification confidence, this period</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Operator-confirmed precision</span>
          <div className="kpi-value">{confusion.precisionPct !== null ? `${confusion.precisionPct}%` : '—'}</div>
          <div className="kpi-sub">{confusion.confirmed} confirmed / {confusion.dismissed} dismissed / {confusion.pending} awaiting review</div>
        </div>
      </div>

      <div className="chart-card">
        <h3>TerraTrace vs. independent field-trial benchmark</h3>
        <p className="benchmark-citation">{perf.benchmark.citation}</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={benchmarkData} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="metric" tick={{ fontSize: 11 }} width={150} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
            <Bar dataKey="TerraTrace" fill="#4318FF" radius={[0, 4, 4, 0]} />
            <Bar dataKey="Industry" fill="#CBD5E0" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={fpData} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" horizontal={false} />
            <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="metric" tick={{ fontSize: 11 }} width={150} />
            <Tooltip />
            <Bar dataKey="TerraTrace" fill="#4318FF" radius={[0, 4, 4, 0]} />
            <Bar dataKey="Industry" fill="#CBD5E0" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Confidence calibration (predicted vs. operator-confirmed)</h3>
        <p className="benchmark-citation">Predicted = the score shown at detection time. Observed = share of that tier's alerts an operator actually accepted in the Decision Engine.</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={reliability} margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
            <XAxis dataKey="tier" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v, name) => [`${v}%`, name]} />
            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
            <Bar dataKey="predictedPct" name="Predicted" fill="#7c5cff" radius={[4, 4, 0, 0]} />
            <Bar dataKey="observedPct" name="Observed" fill="#38A169" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="reliability-footnote">
          {reliability.map((r) => (
            <span key={r.tier}>{r.tier}: {r.reviewedCount}/{r.totalCount} reviewed &nbsp;</span>
          ))}
        </div>
      </div>

      <div className="chart-card">
        <h3>Why did the model flag this alert?</h3>
        {incidents.length === 0 ? (
          <div className="empty-state">No incidents for this branch to explain yet.</div>
        ) : (
          <>
            <select
              className="incident-select"
              value={selectedId}
              onChange={(e) => setSelectedId(Number(e.target.value))}
            >
              {incidents.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.assetId} — {i.equipmentType} ({i.severity}, {i.confidence} confidence, {i.detectionSource})
                </option>
              ))}
            </select>

            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={attribution.factors} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <YAxis type="category" dataKey="factor" tick={{ fontSize: 10.5 }} width={230} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="pct" fill="#4318FF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <p className="explanation-text">{attribution.explanationText}</p>

            <ul className="audit-trail">
              {attribution.factors.map((f) => (
                <li key={f.factor}><strong>{f.factor} ({f.pct}%):</strong> {f.description}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="data-card">
        <div className="data-card-title" style={{ marginBottom: '0.75rem' }}>Model card</div>
        <div className="model-card-grid">
          <div>
            <span className="field-label">Architecture</span>
            <p className="model-card-text">{MODEL_CARD.architecture}</p>
          </div>
          <div>
            <span className="field-label">Training data</span>
            <p className="model-card-text">{MODEL_CARD.trainingData}</p>
          </div>
          <div>
            <span className="field-label">Input signals</span>
            <ul className="audit-trail">
              {MODEL_CARD.inputSignals.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
          <div>
            <span className="field-label">Known limitations</span>
            <ul className="audit-trail">
              {MODEL_CARD.knownLimitations.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
        </div>
        <div className="ethics-note" style={{ marginTop: '1rem' }}>
          <strong>Human oversight:</strong> {MODEL_CARD.humanOversight}
        </div>
      </div>
    </div>
  )
}

export default ExplainableAI
