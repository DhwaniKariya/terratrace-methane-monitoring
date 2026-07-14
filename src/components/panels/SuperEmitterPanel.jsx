import '../../styles/Panels.css'
import '../../styles/SuperEmitterPanel.css'

function SuperEmitterPanel({ incidents }) {
  const superEmitters = incidents.filter((i) => i.superEmitter)

  if (!superEmitters.length) return null

  return (
    <div className="super-emitter-panel">
      <h3>Super-Emitter Events</h3>
      <div className="data-card-list">
        {superEmitters.map((incident) => {
          const se = incident.superEmitter
          return (
            <div className="data-card super-emitter-card" key={incident.id}>
              <div className="data-card-top">
                <span className="data-card-title">SE-{incident.assetId}</span>
                <span className="badge-pill critical">{se.alertStatus}</span>
              </div>
              <div className="field-row">
                <div>
                  <span className="field-label">Peak rate</span>
                  <span className="field-value">{se.peakRateKgH} kg/hr</span>
                </div>
                <div>
                  <span className="field-label">Total release</span>
                  <span className="field-value">{se.totalReleaseT} t</span>
                </div>
                <div>
                  <span className="field-label">Plume size</span>
                  <span className="field-value">{se.plumeSizeKm2} km2</span>
                </div>
                <div>
                  <span className="field-label">Wind direction</span>
                  <span className="field-value">{se.windDirection}</span>
                </div>
                <div>
                  <span className="field-label">Response status</span>
                  <span className="field-value">{se.responseStatus}</span>
                </div>
                <div>
                  <span className="field-label">Impact score</span>
                  <span className="field-value">{se.environmentalImpactScore}/100</span>
                </div>
              </div>
              <p className="dispersion-note">{se.dispersionPrediction}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SuperEmitterPanel
