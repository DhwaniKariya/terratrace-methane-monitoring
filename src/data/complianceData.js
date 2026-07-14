import { generateIncidents } from './mockData'
import { generateVerifications } from './verificationData'
import { generateRecommendations } from './decisionsData'

const CONFIDENCE_SCORE = { high: 90, medium: 65, low: 40 }

// Regulatory scorecard - each framework's status is derived from data already
// produced elsewhere in the app (verifications, incidents, decisions), not a
// separate fabricated number, so the tab reflects what the platform actually
// has evidence for.
export const generateRegulatoryScorecard = (branchId, statusOverrides = {}) => {
  const incidents = generateIncidents(branchId)
  const verifications = generateVerifications(branchId)
  const criticalIncidents = incidents.filter((i) => i.severity === 'critical')

  const avgConfidence = incidents.length
    ? Math.round(incidents.reduce((sum, i) => sum + CONFIDENCE_SCORE[i.confidence], 0) / incidents.length)
    : 0
  const highConfidenceVerifications = verifications.filter((v) => v.verificationConfidencePct >= 80).length

  // EU Methane Regulation (2024) - requires measurement-based quantification,
  // not estimated. We treat "enough measurement-based verifications this
  // period" as the evidence bar.
  let euStatus = 'Non-Compliant'
  if (highConfidenceVerifications >= 2) euStatus = 'Compliant'
  else if (highConfidenceVerifications >= 1) euStatus = 'At Risk'

  // US EPA OOOOb/c - super-emitter response program: every critical event
  // needs a corresponding operator response, not just a detection.
  const respondedCritical = criticalIncidents.length // in this model, every
  // critical incident already has a linked recommendation in the Decision
  // Engine; what matters for compliance is whether it was acted on.
  const recommendations = generateRecommendations(branchId)
  const criticalRecIds = new Set(
    incidents.filter((i) => i.severity === 'critical').map((i) => `REC-${i.assetId}`)
  )
  const actedOnCritical = recommendations.filter((r) => {
    const liveStatus = statusOverrides[r.recommendationId] || r.status
    return criticalRecIds.has(r.recommendationId) && liveStatus !== 'Pending'
  }).length
  let epaStatus = 'Non-Compliant'
  if (criticalIncidents.length === 0) epaStatus = 'Compliant'
  else if (actedOnCritical === criticalIncidents.length) epaStatus = 'Compliant'
  else if (actedOnCritical > 0) epaStatus = 'At Risk'

  // OGMP 2.0 maturity level (1-5). Level 4-5 requires site-level,
  // measurement-based data - what our verification confidence represents.
  let ogmpLevel = 3
  if (avgConfidence >= 85 && verifications.length >= 2) ogmpLevel = 5
  else if (avgConfidence >= 70) ogmpLevel = 4

  // Global Methane Pledge - 30% cut by 2030 vs 2020 levels. Approximated here
  // against the branch's own avoided-emissions performance this period.
  const avoidedT = verifications.reduce((sum, v) => sum + v.co2eReductionT, 0)
  const baselineT = incidents.reduce((sum, i) => sum + i.leakVolume * 30, 0) // rough 30x GWP baseline
  const reductionPct = baselineT > 0 ? Math.min(100, Math.round((avoidedT / baselineT) * 100)) : 0
  const pledgeStatus = reductionPct >= 30 ? 'On Track' : reductionPct >= 15 ? 'Behind Target' : 'At Risk'

  return [
    {
      id: 'eu-reg',
      framework: 'EU Methane Regulation (2024)',
      status: euStatus,
      evidence: `${highConfidenceVerifications} measurement-based verification(s) >=80% confidence this period`,
      deadline: 'Import market access restriction begins 2030',
    },
    {
      id: 'epa',
      framework: 'US EPA OOOOb/c',
      status: epaStatus,
      evidence: criticalIncidents.length === 0
        ? 'No super-emitter events this period'
        : `${actedOnCritical}/${criticalIncidents.length} super-emitter events acted on in Decision Engine`,
      deadline: 'Super-emitter response required within regulatory window',
    },
    {
      id: 'ogmp',
      framework: 'OGMP 2.0 Reporting Level',
      status: `Level ${ogmpLevel}`,
      evidence: ogmpLevel >= 4
        ? 'Facility-level, measurement-based reporting'
        : 'Estimated/generic emission-factor reporting only',
      deadline: 'Gold Standard requires Level 4-5 within 3 years of joining',
    },
    {
      id: 'pledge',
      framework: 'Global Methane Pledge Alignment',
      status: pledgeStatus,
      evidence: `${reductionPct}% estimated reduction vs baseline (target: 30% by 2030)`,
      deadline: '159-country pledge target: 2030',
    },
  ]
}

export const generateGovernanceMetrics = (branchId, statusOverrides = {}) => {
  const incidents = generateIncidents(branchId)
  const recommendations = generateRecommendations(branchId)
  const verifications = generateVerifications(branchId)

  const reviewed = recommendations.filter((r) => (statusOverrides[r.recommendationId] || r.status) !== 'Pending').length
  const humanReviewRatePct = recommendations.length
    ? Math.round((reviewed / recommendations.length) * 100)
    : 100

  const avgConfidencePct = incidents.length
    ? Math.round(incidents.reduce((sum, i) => sum + CONFIDENCE_SCORE[i.confidence], 0) / incidents.length)
    : 0

  const sourceCounts = incidents.reduce((acc, i) => {
    acc[i.detectionSource] = (acc[i.detectionSource] || 0) + 1
    return acc
  }, {})
  const trackedTotal = Object.values(sourceCounts).reduce((sum, c) => sum + c, 0)
  const dataProvenance = Object.entries(sourceCounts).map(([source, count]) => ({
    source,
    pct: trackedTotal ? Math.round((count / trackedTotal) * 100) : 0,
  }))

  const auditTrailCompletePct = verifications.length
    ? Math.round((verifications.filter((v) => v.auditTrail.length >= 4).length / verifications.length) * 100)
    : 100

  return {
    humanReviewRatePct,
    avgConfidencePct,
    dataProvenance,
    auditTrailCompletePct,
    pendingReview: recommendations.length - reviewed,
  }
}
