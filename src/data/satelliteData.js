import { generateIncidents } from './mockData'

// Reference "today" matches the timeline shown elsewhere in the dashboard.
const TODAY = new Date(Date.UTC(2025, 10, 23))

const SATELLITES = [
  { name: 'Sentinel-2', operator: 'ESA', resolutionM: 10, bands: 'B11/B12 SWIR' },
  { name: 'Landsat 8/9', operator: 'USGS', resolutionM: 30, bands: 'Band 6/7 SWIR' },
]

// Gaps between passes: Sentinel-2 alone revisits every 5 days, Landsat 8 and
// 9 offset revisit every ~8 days each - interleaving both constellations
// gives an irregular but frequent combined cadence, roughly every 1-5 days,
// which is what's actually flown today rather than a single clean interval.
const GAP_PATTERN_DAYS = [2, 3, 1, 4, 2, 5, 1, 3]
const CLOUD_SKIP_SLOTS = [2, 5] // indices where cloud cover made the pass unusable

export const generatePassHistory = (branchId) => {
  let cursor = new Date(TODAY)
  const passes = []

  for (let i = 0; i < GAP_PATTERN_DAYS.length; i++) {
    const satellite = SATELLITES[(branchId + i) % SATELLITES.length]
    const usable = !CLOUD_SKIP_SLOTS.includes(i)
    passes.unshift({
      id: `PASS-${branchId}-${i}`,
      date: cursor.toISOString(),
      satellite: satellite.name,
      operator: satellite.operator,
      resolutionM: satellite.resolutionM,
      bands: satellite.bands,
      cloudCoverPct: usable ? [5, 10, 15, 8, 20][i % 5] : [65, 80, 90][i % 3],
      usable,
    })
    cursor = new Date(cursor.getTime() - GAP_PATTERN_DAYS[i] * 24 * 3600 * 1000)
  }

  return passes
}

export const getDataFreshness = (branchId) => {
  const passes = generatePassHistory(branchId)
  const usablePasses = passes.filter((p) => p.usable)
  const lastUsable = usablePasses[usablePasses.length - 1]
  const daysSinceLastPass = Math.round((TODAY.getTime() - new Date(lastUsable.date).getTime()) / (24 * 3600 * 1000))
  const nextExpectedInDays = [1, 2, 3, 4, 5][branchId % 5]

  return {
    daysSinceLastPass,
    nextExpectedInDays,
    usableThisPeriod: usablePasses.length,
    totalThisPeriod: passes.length,
    lastSatellite: lastUsable.satellite,
  }
}

// Deterministic "hotspot" placement (percent coordinates) for the mock
// SWIR/heatmap visualization panel, anchored to the branch's most severe
// active incident so the visual isn't disconnected from the incident data.
export const getLatestCaptureContext = (branchId) => {
  const incidents = generateIncidents(branchId)
  const worst = [...incidents].sort((a, b) => {
    const rank = { critical: 3, high: 2, medium: 1, low: 0 }
    return rank[b.severity] - rank[a.severity]
  })[0]

  return {
    incident: worst,
    hotspotX: 38 + (branchId * 7) % 24,
    hotspotY: 42 + (branchId * 11) % 20,
  }
}
