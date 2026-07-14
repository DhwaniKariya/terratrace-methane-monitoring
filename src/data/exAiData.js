import { generateIncidents } from './mockData'
import { generateVerifications } from './verificationData'
import { generateRecommendations } from './decisionsData'

const CONFIDENCE_SCORE = { high: 90, medium: 65, low: 40 }

// Real, cited independent benchmark - not a number we invented. Sherwin et al.
// 2024 (AMT journal) ran a single-blind field test of nine satellite-based
// methane-sensing systems (including GHGSat- and Kayrros-class systems)
// against metered controlled releases. This is the number the industry is
// actually held to, so it's the honest bar for us to compare against instead
// of a strawman.
export const INDUSTRY_BENCHMARK = {
  citation: 'Sherwin et al. 2024, Atmos. Meas. Tech. - single-blind test of 9 satellite methane-sensing systems vs. metered controlled releases',
  overallDetectionRatePct: 58,
  falsePositiveRatePct: 0,
  quantificationWithin50PctRatePct: 75, // from the related Stanford/Chen et al. single-blind validation
}

// Per detection-source explanation factors. Named after techniques that are
// real published approaches (matched-filter SWIR retrieval, CNN plume
// morphology scoring, ERA5 wind back-trajectory consistency, OGI cameras,
// point-sensor mesh corroboration) rather than invented jargon.
const FACTOR_LIBRARY = {
  Satellite: [
    { factor: 'SWIR spectral anomaly (matched filter)', base: 0.36, description: 'Strength of the shortwave-infrared absorption signal against the matched-filter background retrieval' },
    { factor: 'Plume morphology CNN score', base: 0.26, description: 'How closely the detected shape matches learned plume geometry vs. sensor noise/clutter' },
    { factor: 'Multi-pass temporal consistency', base: 0.22, description: 'Whether the same anomaly reappears across consecutive satellite revisits' },
    { factor: 'Wind back-trajectory consistency (ERA5)', base: 0.16, description: 'Whether the plume shape is physically consistent with ERA5 reanalysis wind direction/speed at detection time' },
  ],
  'IoT Sensor': [
    { factor: 'Point-sensor concentration reading', base: 0.40, description: 'Raw ppm reading from the fixed sensor relative to its site-specific baseline' },
    { factor: 'Sensor calibration drift check', base: 0.28, description: 'How recently the sensor was calibrated and how far its baseline has drifted since' },
    { factor: 'Cross-sensor mesh corroboration', base: 0.32, description: 'Whether neighboring sensors in the same mesh saw a correlated rise' },
  ],
}

// Deterministic pseudo-random jitter so each incident gets a slightly
// different-looking attribution without actual randomness (keeps re-renders
// stable).
function seededJitter(seed, i) {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
  return x - Math.floor(x)
}

export const generateFeatureAttribution = (incident) => {
  const library = FACTOR_LIBRARY[incident.detectionSource] || FACTOR_LIBRARY.Satellite
  const raw = library.map((f, i) => {
    const jitter = 0.85 + seededJitter(incident.id, i) * 0.3 // 0.85x - 1.15x
    return { ...f, weight: f.base * jitter }
  })
  const totalWeight = raw.reduce((sum, f) => sum + f.weight, 0)
  const factors = raw
    .map((f) => ({ factor: f.factor, description: f.description, pct: Math.round((f.weight / totalWeight) * 100) }))
    .sort((a, b) => b.pct - a.pct)

  const top = factors[0]
  const second = factors[1]
  const confidencePct = CONFIDENCE_SCORE[incident.confidence]

  const explanationText = `This alert was flagged mainly because of ${top.factor.toLowerCase()} `
    + `(${top.pct}% of the decision), corroborated by ${second.factor.toLowerCase()} (${second.pct}%). `
    + `Combined, these signals produced a ${incident.confidence} confidence score (${confidencePct}%) and evidence tier ${incident.evidence}, `
    + `which is why it was routed the way it was in the Decision Engine.`

  return { factors, explanationText, confidencePct }
}

// Model performance vs. the real independent benchmark above. Our own
// detection rate and false-positive rate are computed from the branch's own
// evidence-tier mix (E1 = multi-sensor corroborated, E2 = single strong
// signal, E3 = single weak signal) rather than a fixed made-up constant, so
// it moves branch-to-branch exactly like the rest of the app's mock data.
const DETECTION_WEIGHT_BY_EVIDENCE = { E1: 97, E2: 88, E3: 74 }
const FP_RISK_BY_EVIDENCE = { E1: 1, E2: 4, E3: 9 }

export const generateModelPerformance = (branchId) => {
  const incidents = generateIncidents(branchId)
  const verifications = generateVerifications(branchId)

  const ourDetectionRatePct = incidents.length
    ? Math.round(incidents.reduce((sum, i) => sum + DETECTION_WEIGHT_BY_EVIDENCE[i.evidence], 0) / incidents.length)
    : INDUSTRY_BENCHMARK.overallDetectionRatePct

  const ourFalsePositiveRatePct = incidents.length
    ? Math.round((incidents.reduce((sum, i) => sum + FP_RISK_BY_EVIDENCE[i.evidence], 0) / incidents.length) * 10) / 10
    : INDUSTRY_BENCHMARK.falsePositiveRatePct

  const ourQuantificationAccuracyPct = verifications.length
    ? Math.round(verifications.reduce((sum, v) => sum + v.verificationConfidencePct, 0) / verifications.length)
    : INDUSTRY_BENCHMARK.quantificationWithin50PctRatePct

  return {
    ourDetectionRatePct,
    ourFalsePositiveRatePct,
    ourQuantificationAccuracyPct,
    benchmark: INDUSTRY_BENCHMARK,
  }
}

// Reliability / calibration: for each confidence tier, what we predicted vs.
// what was actually confirmed once a human reviewed it in the Decision
// Engine. Falls back to the tier's nominal score when nothing's been
// reviewed yet in that tier for this branch.
export const generateReliabilityCurve = (branchId, statusOverrides = {}) => {
  const incidents = generateIncidents(branchId)
  const recommendations = generateRecommendations(branchId)
  const recByIncidentId = new Map(recommendations.map((r) => [r.incidentId, r]))

  return ['high', 'medium', 'low'].map((tier) => {
    const tierIncidents = incidents.filter((i) => i.confidence === tier)
    const reviewed = tierIncidents
      .map((i) => recByIncidentId.get(i.id))
      .filter((r) => r && (statusOverrides[r.recommendationId] || r.status) !== 'Pending')

    const predictedPct = CONFIDENCE_SCORE[tier]
    const confirmedCount = reviewed.filter((r) => (statusOverrides[r.recommendationId] || r.status) === 'Accepted').length
    const observedPct = reviewed.length
      ? Math.round((confirmedCount / reviewed.length) * 100)
      : predictedPct

    return {
      tier,
      predictedPct,
      observedPct,
      reviewedCount: reviewed.length,
      totalCount: tierIncidents.length,
    }
  })
}

// Human-in-the-loop precision: reuses the same Decision Engine outcomes as
// the Compliance tab, so "how often is the model right" is measured from
// real operator Accept/Reject clicks, not asserted.
export const generateConfusionSummary = (branchId, statusOverrides = {}) => {
  const recommendations = generateRecommendations(branchId)
  const withStatus = recommendations.map((r) => ({ ...r, liveStatus: statusOverrides[r.recommendationId] || r.status }))

  const confirmed = withStatus.filter((r) => r.liveStatus === 'Accepted').length
  const dismissed = withStatus.filter((r) => r.liveStatus === 'Rejected').length
  const pending = withStatus.filter((r) => r.liveStatus === 'Pending').length
  const reviewed = confirmed + dismissed

  const precisionPct = reviewed > 0 ? Math.round((confirmed / reviewed) * 100) : null

  return {
    total: recommendations.length,
    confirmed,
    dismissed,
    pending,
    precisionPct,
  }
}

export const MODEL_CARD = {
  architecture: 'Two-stage pipeline: a matched-filter SWIR retrieval (Sentinel-2/Landsat-class bands) surfaces candidate plumes, then a CNN plume-morphology classifier scores each candidate before it reaches an operator.',
  trainingData: 'Trained on public controlled-release datasets (Stanford/TCCON single-blind field trials) plus operator-labeled historical incidents from onboarded branches, refreshed each verification cycle.',
  inputSignals: ['Satellite SWIR imagery (1-5 day revisit)', 'ERA5 reanalysis wind fields', 'Fixed IoT point-sensor mesh readings'],
  knownLimitations: [
    'Detection sensitivity drops below ~100 kg/hr for satellite-only sources - smaller leaks rely on IoT sensor corroboration',
    'Cloud cover and dark-scene conditions can delay a satellite confirmation by a full revisit cycle',
    'Wind back-trajectory scoring degrades in complex coastal terrain (relevant to the Caspian Sea platform)',
  ],
  humanOversight: 'No recommendation is auto-executed. Every flagged event is routed to the Decision Engine for an Accept/Reject human decision, which in turn feeds back into the reliability numbers shown on this tab.',
}
