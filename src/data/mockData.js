export const branches = [
  { 
    id: 1, 
    name: 'Azerbaijan Operations', 
    location: 'Baku, Azerbaijan', 
    lat: 40.4093, 
    lng: 49.8671, 
    incidents: 61, 
    image: '/img/1.jpg',
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
    image: '/img/2.jpg',
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
    image: '/img/3.jpg',
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
    image: '/img/4.jpg',
    credits: 48,
    emissions: [
      { label: 'Methane', value: 2, color: '#E53E3E' },
      { label: 'CO2', value: 3, color: '#DD6B20' },
      { label: 'NOx', value: 1, color: '#D69E2E' },
    ]
  }
]

export const generateIncidents = (branchId) => {
  const baseIncidents = [
    { id: 1, lat: 40.3, lng: 49.8, severity: 'critical', confidence: 'high', evidence: 'E1' },
    { id: 2, lat: 40.5, lng: 49.9, severity: 'high', confidence: 'high', evidence: 'E1' },
    { id: 3, lat: 40.4, lng: 50.1, severity: 'high', confidence: 'medium', evidence: 'E2' },
    { id: 4, lat: 40.45, lng: 49.7, severity: 'medium', confidence: 'high', evidence: 'E2' },
    { id: 5, lat: 40.35, lng: 50.0, severity: 'medium', confidence: 'medium', evidence: 'E2' },
    { id: 6, lat: 40.42, lng: 49.95, severity: 'low', confidence: 'low', evidence: 'E3' },
  ]
  return baseIncidents
}
