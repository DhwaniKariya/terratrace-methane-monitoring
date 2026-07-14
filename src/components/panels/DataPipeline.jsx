import { useState, useRef, useEffect } from 'react'
import { IconSatellite, IconCpu, IconMapPin, IconBellRinging, IconPlayerPlay } from '@tabler/icons-react'
import { format } from 'date-fns'
import { generatePassHistory, getDataFreshness, getLatestCaptureContext } from '../../data/satelliteData'
import '../../styles/Panels.css'
import '../../styles/DataPipeline.css'

const STEPS = [
  {
    icon: IconSatellite,
    title: '01 - Satellite data ingestion',
    description: 'Sentinel-2 (ESA, free, 10m, 5-day revisit) and Landsat 8/9 (USGS, free, 30m, 16-day revisit) SWIR bands 11/12, where methane absorbs solar radiation.',
    logLines: [
      'Ingesting Sentinel-2 L1C tile (10m, bands B11/B12)...',
      'Fetching Landsat 8/9 Collection 2 Level-1 scene (30m, SWIR bands 6/7)...',
    ],
  },
  {
    icon: IconCpu,
    title: '02 - AI spectral & spatial analysis',
    description: 'CNN/ViT model trained on known plume spectral signatures. Cloud, aerosol and terrain-reflectance filtering, then multitemporal comparison against a clean baseline.',
    logLines: [
      'Removing cloud cover, atmospheric aerosols, terrain reflectance artifacts...',
      'Running CNN plume-detection model against multitemporal baseline...',
      'Generating methane probability heatmap...',
    ],
  },
  {
    icon: IconMapPin,
    title: '03 - Plume detection & attribution',
    description: 'Anomalies cross-referenced with facility location databases. ERA5 wind-field back-tracing attributes the plume to a source, with kg/hr emission-rate estimation.',
    logLines: [
      'Cross-referencing anomaly with facility location registry...',
      'Back-tracing plume dispersion using ERA5 reanalysis wind field...',
      'Estimating emission rate (kg/hr) and confidence score...',
    ],
  },
  {
    icon: IconBellRinging,
    title: '04 - Alert & regulatory reporting',
    description: 'Operators alerted within 24-48h of the satellite pass, with GPS coordinates, confidence score, and before/after evidence, formatted for OGMP 2.0 / EU Methane Regulation.',
    logLines: [
      'Formatting alert for OGMP 2.0 / EU Methane Regulation disclosure...',
      'Alert dispatched - GPS, confidence score, before/after evidence attached.',
    ],
  },
]

function DataPipeline({ branchId }) {
  const passes = generatePassHistory(branchId)
  const freshness = getDataFreshness(branchId)
  const { incident, hotspotX, hotspotY } = getLatestCaptureContext(branchId)

  // Real NASA public-domain satellite photography (Baku oil fields, ISS002-
  // ESC-6176) used as a stand-in base layer so the mock actually looks like
  // satellite imagery. Hue is shifted per branch purely so every site isn't
  // showing the visually identical frame - this is clearly labeled as
  // illustrative, not a live tile for each specific location.
  const hueShift = (branchId * 35) % 360
  const rawImageStyle = {
    backgroundImage: 'url(/img/satellite-baku.jpg)',
    filter: `hue-rotate(${hueShift}deg) saturate(1.15) contrast(1.05)`,
  }
  const processedImageStyle = {
    backgroundImage: 'url(/img/satellite-baku.jpg)',
    filter: `hue-rotate(${hueShift}deg) saturate(1.15) brightness(0.85)`,
  }

  const [activeStep, setActiveStep] = useState(-1)
  const [log, setLog] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const consoleRef = useRef(null)

  useEffect(() => {
    if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight
  }, [log])

  const pushLog = (text) => {
    setLog((prev) => [...prev, { text, time: format(new Date(), 'HH:mm:ss') }])
  }

  // activeStep counts up from 0 to STEPS.length. Every step with an index
  // below it is done; STEPS.length means the whole pass is complete. Driven
  // by a single number (not a separate "completed" list plus a mutable
  // closure variable) so there's no way for the two to drift out of sync.
  const scheduleStep = (index) => {
    if (index >= STEPS.length) {
      setIsRunning(false)
      pushLog('New capture fully processed and ready on the dashboard.')
      return
    }

    const step = STEPS[index]
    step.logLines.forEach((line, i) => {
      setTimeout(() => pushLog(line), i * 350)
    })

    setTimeout(() => {
      setActiveStep(index + 1)
      scheduleStep(index + 1)
    }, step.logLines.length * 350 + 400)
  }

  const runSimulatedPass = () => {
    if (isRunning) return
    setIsRunning(true)
    setLog([])
    setActiveStep(0)
    scheduleStep(0)
  }

  const stepStatus = (i) => {
    if (i < activeStep) return 'complete'
    if (i === activeStep && isRunning) return 'active'
    return 'pending'
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Satellite Data Pipeline</h2>
        <p>How a new data point actually reaches this dashboard - from orbit to alert</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Last usable pass</span>
          <div className="kpi-value">{freshness.daysSinceLastPass}d ago</div>
          <div className="kpi-sub">{freshness.lastSatellite}</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Next expected pass</span>
          <div className="kpi-value">in {freshness.nextExpectedInDays}d</div>
          <div className="kpi-sub">combined Sentinel-2 / Landsat revisit</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Usable passes this period</span>
          <div className="kpi-value">{freshness.usableThisPeriod}/{freshness.totalThisPeriod}</div>
          <div className="kpi-sub">rest lost to cloud cover</div>
        </div>
      </div>

      <h3 style={{ fontSize: '0.95rem', marginBottom: '0.25rem', color: '#1a202c' }}>Recent satellite passes</h3>
      <p className="freshness-note">Every dot is one satellite overpass for this site - not every pass yields usable data.</p>

      <div className="pass-legend">
        <span><span className="legend-dot" style={{ background: '#3182CE' }}></span>Sentinel-2 (10m)</span>
        <span><span className="legend-dot" style={{ background: '#DD6B20' }}></span>Landsat 8/9 (30m)</span>
        <span><span className="legend-dot" style={{ background: '#CBD5E0' }}></span>Skipped - cloud cover</span>
      </div>

      <div className="pass-timeline-track">
        {passes.map((p) => (
          <div className="pass-chip" key={p.id}>
            <div className={`pass-dot ${p.usable ? (p.satellite === 'Sentinel-2' ? 'sentinel' : 'landsat') : 'skipped'}`}>
              {p.usable ? `${p.resolutionM}m` : '☁'}
            </div>
            <div className="pass-label">
              <strong>{format(new Date(p.date), 'dd MMM')}</strong>
              {p.usable ? `${p.cloudCoverPct}% cloud` : `${p.cloudCoverPct}% cloud`}
            </div>
          </div>
        ))}
      </div>

      <div className="imagery-row">
        <div className="imagery-card">
          <h4>Raw SWIR band composite</h4>
          <p className="imagery-sub">{incident?.assetId} - bands 11/12, before AI processing</p>
          <div className="sat-viewport raw" style={rawImageStyle}>
            <div className="facility-marker" style={{ left: `${hotspotX}%`, top: `${hotspotY}%` }} />
            <span className="viewport-tag">Illustrative rendering - base imagery: NASA Earth Observatory (public domain)</span>
          </div>
        </div>

        <div className="imagery-card">
          <h4>AI methane probability heatmap</h4>
          <p className="imagery-sub">{incident?.confidence} confidence - {incident?.ch4Rate} kg/hr estimated</p>
          <div className="sat-viewport processed" style={processedImageStyle}>
            <div className="processed-tint" />
            <div className="processed-scrim" />
            <div className="pixel-grid-overlay" />
            <div className="plume-hotspot" style={{ left: `${hotspotX}%`, top: `${hotspotY}%` }} />
            <div className="facility-marker" style={{ left: `${hotspotX}%`, top: `${hotspotY}%` }} />
            {isRunning && <div className="scan-line" />}
            <span className="viewport-tag">Illustrative rendering</span>
          </div>
          <div className="heatmap-legend">
            <span>Low</span>
            <div className="scale"></div>
            <span>High</span>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#1a202c' }}>Processing pipeline</h3>

      <button className="run-pass-btn" onClick={runSimulatedPass} disabled={isRunning}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <IconPlayerPlay size={16} />
          {isRunning ? 'Processing new pass...' : 'Simulate next satellite pass'}
        </span>
      </button>

      <div className="pipeline-stepper">
        {STEPS.map((step, i) => {
          const status = stepStatus(i)
          const Icon = step.icon
          return (
            <div className={`pipeline-step ${status}`} key={step.title}>
              <div className="step-icon"><Icon size={20} /></div>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
              <div className="step-status">
                {status === 'complete' ? 'Complete' : status === 'active' ? 'Processing...' : 'Pending'}
              </div>
            </div>
          )
        })}
      </div>

      <div className="processing-console" ref={consoleRef}>
        {log.length === 0 ? (
          <div className="log-empty">$ waiting for next simulated pass...</div>
        ) : (
          log.map((entry, i) => (
            <div className="log-line" key={i}>
              <span className="ts">[{entry.time}]</span>{entry.text}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DataPipeline
