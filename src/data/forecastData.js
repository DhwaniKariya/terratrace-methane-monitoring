import { generateIncidents } from './mockData'

const WIND_SPEEDS_KMH = [12, 18, 9, 24, 15]
const TEMPERATURES_C = [28, 31, 19, 24, 33]
const PRESSURES_BAR = [4.1, 3.6, 5.0, 2.9, 4.4]
const FLOW_RATES_M3H = [850, 620, 1100, 430, 900]
const SEVERITY_BY_PROBABILITY = (p) => (p >= 70 ? 'High' : p >= 40 ? 'Medium' : 'Low')

export const generateForecasts = (branchId) => {
  const incidents = generateIncidents(branchId)

  return incidents.map((incident, i) => {
    const riskScore = Math.min(97, Math.round(incident.ch4Rate / 35 + (incident.confidence === 'high' ? 15 : 5)))
    const leakProbabilityPct = Math.min(95, Math.round(riskScore * 0.9))
    const predictedEmissionKgH = Math.round(incident.ch4Rate * (1 + (riskScore - 50) / 200))

    return {
      forecastId: `FC-${incident.assetId}`,
      assetId: incident.assetId,
      equipmentType: incident.equipmentType,
      riskScore,
      leakProbabilityPct,
      predictedEmissionKgH,
      hotspotLat: incident.lat,
      hotspotLng: incident.lng,
      forecastPeriod: ['7 days', '14 days', '30 days'][i % 3],
      windSpeedKmh: WIND_SPEEDS_KMH[i % WIND_SPEEDS_KMH.length],
      temperatureC: TEMPERATURES_C[i % TEMPERATURES_C.length],
      pressureBar: PRESSURES_BAR[i % PRESSURES_BAR.length],
      flowRateM3h: FLOW_RATES_M3H[i % FLOW_RATES_M3H.length],
      historicalPatternRef: `PATTERN-${incident.equipmentType.slice(0, 3).toUpperCase()}-${(i % 4) + 1}`,
      predictedSeverity: SEVERITY_BY_PROBABILITY(leakProbabilityPct),
    }
  })
}

// 14-day risk-score trend line for the branch overall, used by the Forecast
// tab's chart. Deterministic upward/downward drift so branches with more
// active incidents show a visibly rising trend.
export const generateRiskTrend = (branchId) => {
  const forecasts = generateForecasts(branchId)
  const avgRisk = forecasts.length
    ? Math.round(forecasts.reduce((sum, f) => sum + f.riskScore, 0) / forecasts.length)
    : 30

  return Array.from({ length: 14 }, (_, day) => {
    const drift = Math.sin(day / 2) * 6 + (day - 7) * (avgRisk > 55 ? 1.1 : -0.3)
    return {
      day: `Day ${day + 1}`,
      riskScore: Math.max(5, Math.min(99, Math.round(avgRisk + drift))),
    }
  })
}
