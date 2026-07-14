import { generateIncidents } from './mockData'

const ROOT_CAUSES = {
  Compressor: 'Seal degradation',
  Valve: 'Valve failure',
  'Storage Tank': 'Pressure anomaly',
  Flare: 'Combustion inefficiency',
  Pipeline: 'Corrosion / joint failure',
}

const SUGGESTED_ACTIONS = {
  Compressor: 'Replace compressor seal, isolate unit during swap',
  Valve: 'Isolate pipeline segment, replace valve',
  'Storage Tank': 'Reduce tank pressure, inspect relief valve',
  Flare: 'Re-tune flare air/fuel ratio',
  Pipeline: 'Isolate segment, schedule pipeline repair crew',
}

const TEAMS = ['Field Ops - North', 'Field Ops - South', 'Maintenance Crew A', 'Maintenance Crew B', 'Pipeline Integrity Team']

const PRIORITY_BY_SEVERITY = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }

export const generateRecommendations = (branchId) => {
  const incidents = generateIncidents(branchId)
  return incidents.map((incident, i) => {
    const recommendationId = `REC-${incident.assetId}`
    const rootCause = ROOT_CAUSES[incident.equipmentType] || 'Unknown mechanical fault'
    const expectedReductionKgH = Math.round(incident.ch4Rate * 0.75)
    const downtimeEstimateHours = [8, 4, 6, 2, 3][i % 5]
    const confidencePct = incident.confidence === 'high' ? 88 + (i % 8) : incident.confidence === 'medium' ? 65 + (i % 10) : 45 + (i % 10)
    const estimatedCostEUR = 1380 + incident.ch4Rate * 2.8 + downtimeEstimateHours * 368

    return {
      recommendationId,
      incidentId: incident.id,
      assetId: incident.assetId,
      rootCause,
      suggestedAction: SUGGESTED_ACTIONS[incident.equipmentType] || 'Dispatch field inspection team',
      priority: PRIORITY_BY_SEVERITY[incident.severity] || 'Medium',
      expectedReductionKgH,
      downtimeEstimateHours,
      confidencePct,
      status: 'Pending',
      responsibleTeam: TEAMS[(branchId + i) % TEAMS.length],
      estimatedCostEUR: Math.round(estimatedCostEUR),
    }
  })
}
