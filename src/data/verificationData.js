import { generateIncidents } from './mockData'

const INTERVENTION_TYPES = ['Valve replacement', 'Pressure reduction', 'Seal repair', 'Flare re-tuning', 'Pipeline patch']
const ESG_CATEGORIES = ['CSRD', 'GRI', 'TCFD']
const EVIDENCE_SOURCES = ['Satellite before/after imagery', 'IoT sensor log + maintenance record']

// CH4 -> CO2e using the IPCC AR6 GWP-100 figure our own research brief cites (28-34x).
const GWP_100 = 30

export const generateVerifications = (branchId) => {
  const incidents = generateIncidents(branchId)
  // Only resolved/in-progress super-emitters and a couple of the larger
  // non-critical events realistically have a completed intervention to verify.
  const candidates = incidents.filter((inc) => inc.severity === 'critical' || inc.severity === 'high')

  return candidates.map((incident, i) => {
    const baselineKgH = incident.ch4Rate
    const postActionKgH = Math.round(baselineKgH * (0.05 + (i % 3) * 0.03))
    const avoidedKgH = baselineKgH - postActionKgH
    const avoidedTonnes = Math.round(avoidedKgH * incident.durationHours / 1000 * 10) / 10
    const co2eReductionT = Math.round(avoidedTonnes * GWP_100 * 10) / 10
    const verificationConfidencePct = incident.confidence === 'high' ? 90 + (i % 6) : 72 + (i % 10)

    return {
      verificationId: `VER-${incident.assetId}`,
      assetId: incident.assetId,
      interventionType: INTERVENTION_TYPES[(branchId + i) % INTERVENTION_TYPES.length],
      interventionDate: new Date(Date.UTC(2025, 10, 24 + i)).toISOString(),
      baselineKgH,
      postActionKgH,
      avoidedKgH,
      co2eReductionT,
      evidenceSource: EVIDENCE_SOURCES[(branchId + i) % EVIDENCE_SOURCES.length],
      verificationConfidencePct,
      auditTrail: [
        `Baseline measurement recorded (${baselineKgH} kg/hr) - ${incident.detectionSource}`,
        `Intervention dispatched: ${INTERVENTION_TYPES[(branchId + i) % INTERVENTION_TYPES.length]}`,
        `Post-action measurement recorded (${postActionKgH} kg/hr)`,
        `Reconciled against OGMP 2.0 measurement-based reporting template`,
      ],
      carbonCreditEligible: verificationConfidencePct >= 80,
      esgCategory: ESG_CATEGORIES[(branchId + i) % ESG_CATEGORIES.length],
      insuranceRiskReductionPct: Math.min(40, Math.round(avoidedKgH / baselineKgH * 45)),
    }
  })
}
