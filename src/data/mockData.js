const IMG_BASE = import.meta.env.BASE_URL

export const branches = [
  {
    id: 1,
    name: 'Azerbaijan Operations',
    location: 'Baku, Azerbaijan',
    lat: 40.4093,
    lng: 49.8671,
    incidents: 61,
    image: `${IMG_BASE}img/1.jpg`,
    credits: 38,
    emissions: [
      { label: 'Methane', value: 8, color: '#E53E3E' },
      { label: 'CO2', value: 6, color: '#DD6B20' },
      { label: 'NOx', value: 4, color: '#D69E2E' },
    ]
  },
  {
    id: 2,
    name: 'Caspian Sea Platform',
    location: 'Caspian Sea',
    lat: 41.2,
    lng: 50.5,
    incidents: 24,
    image: `${IMG_BASE}img/2.jpg`,
    credits: 42,
    emissions: [
      { label: 'Methane', value: 5, color: '#E53E3E' },
      { label: 'CO2', value: 7, color: '#DD6B20' },
      { label: 'NOx', value: 3, color: '#D69E2E' },
    ]
  },
  {
    id: 3,
    name: 'Turkey Operations',
    location: 'Istanbul, Turkey',
    lat: 41.0082,
    lng: 28.9784,
    incidents: 18,
    image: `${IMG_BASE}img/3.jpg`,
    credits: 45,
    emissions: [
      { label: 'Methane', value: 3, color: '#E53E3E' },
      { label: 'CO2', value: 5, color: '#DD6B20' },
      { label: 'NOx', value: 2, color: '#D69E2E' },
    ]
  },
  {
    id: 4,
    name: 'Armenia Facility',
    location: 'Yerevan, Armenia',
    lat: 40.1792,
    lng: 44.4991,
    incidents: 7,
    image: `${IMG_BASE}img/4.jpg`,
    credits: 48,
    emissions: [
      { label: 'Methane', value: 2, color: '#E53E3E' },
      { label: 'CO2', value: 3, color: '#DD6B20' },
      { label: 'NOx', value: 1, color: '#D69E2E' },
    ]
  }
]

const EQUIPMENT_TYPES = ['Compressor', 'Valve', 'Storage Tank', 'Flare', 'Pipeline']
const DETECTION_SOURCES = ['Satellite', 'IoT Sensor']
const EVENT_TYPES = ['Fugitive leak', 'Venting', 'Combustion inefficiency']

// Deterministic small offsets (degrees) so each branch gets its own cluster of
// incidents around its real coordinates instead of a single hardcoded location.
const OFFSETS = [
  { dLat: -0.09, dLng: -0.05 },
  { dLat: 0.10, dLng: 0.03 },
  { dLat: 0.03, dLng: 0.22 },
  { dLat: 0.06, dLng: -0.15 },
  { dLat: -0.05, dLng: 0.10 },
  { dLat: 0.02, dLng: -0.02 },
]

const SEVERITY_BY_SLOT = ['critical', 'high', 'high', 'medium', 'medium', 'low']
const CONFIDENCE_BY_SLOT = ['high', 'high', 'medium', 'high', 'medium', 'low']
const EVIDENCE_BY_SLOT = ['E1', 'E1', 'E2', 'E2', 'E2', 'E3']

function buildIncident(branch, slot, idOffset) {
  const severity = SEVERITY_BY_SLOT[slot]
  const offset = OFFSETS[slot]
  const ch4Rate = Math.round([3200, 1800, 1150, 640, 410, 180][slot] * (0.85 + (slot % 3) * 0.1))
  const durationHours = [36, 22, 60, 14, 8, 5][slot]
  const detectedAt = new Date(Date.UTC(2025, 10, 20 - slot * 2, 6 + slot, 15))

  const incident = {
    id: branch.id * 100 + idOffset,
    assetId: `AST-${branch.name.slice(0, 2).toUpperCase()}-${String(100 + branch.id * 10 + slot).slice(-3)}`,
    lat: branch.lat + offset.dLat,
    lng: branch.lng + offset.dLng,
    severity,
    confidence: CONFIDENCE_BY_SLOT[slot],
    evidence: EVIDENCE_BY_SLOT[slot],
    timestamp: detectedAt.toISOString(),
    equipmentType: EQUIPMENT_TYPES[(branch.id + slot) % EQUIPMENT_TYPES.length],
    ch4Rate,
    leakVolume: Math.round(ch4Rate * durationHours / 1000 * 10) / 10, // tonnes released so far
    durationHours,
    detectionSource: DETECTION_SOURCES[(branch.id + slot) % DETECTION_SOURCES.length],
    eventType: EVENT_TYPES[(branch.id + slot) % EVENT_TYPES.length],
  }

  // Module 7 - Super-Emitter fields, only populated for critical events
  if (severity === 'critical') {
    incident.superEmitter = {
      peakRateKgH: Math.round(ch4Rate * 1.35),
      totalReleaseT: incident.leakVolume,
      plumeSizeKm2: Math.round((ch4Rate / 1000) * 4.2 * 10) / 10,
      windDirection: ['NW', 'N', 'NE', 'E', 'SE'][branch.id % 5],
      dispersionPrediction: 'Expanding toward populated area within 6h',
      alertStatus: 'Critical',
      responseStatus: idOffset % 2 === 0 ? 'In progress' : 'Resolved',
      environmentalImpactScore: Math.min(95, Math.round(ch4Rate / 40)),
    }
  }

  return incident
}

// Each branch gets a slice of the shared slot template sized roughly to its
// reported incident badge count, so bigger sites show more map pins.
const SLOT_COUNT_BY_BRANCH = { 1: 6, 2: 4, 3: 3, 4: 2 }

export const generateIncidents = (branchId) => {
  const branch = branches.find(b => b.id === branchId) || branches[0]
  const count = SLOT_COUNT_BY_BRANCH[branchId] || 4
  return Array.from({ length: count }, (_, slot) => buildIncident(branch, slot, slot + 1))
}
