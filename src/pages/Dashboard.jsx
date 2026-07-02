import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { branches, generateIncidents } from '../data/mockData'
import Header from '../components/Header'
import CollapsibleSidebar from '../components/CollapsibleSidebar'
import '../styles/Dashboard.css'

function Dashboard() {
  const { branchId } = useParams()
  const navigate = useNavigate()
  const [currentBranchId, setCurrentBranchId] = useState(parseInt(branchId))
  const branch = branches.find(b => b.id === currentBranchId)
  const [incidents, setIncidents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [filters, setFilters] = useState({
    severity: { critical: false, high: false, medium: false, low: false },
    evidence: { E1: false, E2: false, E3: false },
    confidence: { high: false, medium: false, low: false }
  })
  
  const loadingSteps = ['Getting info from satellite...', 'Trying to find leaks...', 'Prioritizing...']

  useEffect(() => {
    setIncidents(generateIncidents(currentBranchId))
  }, [currentBranchId])

  const handleBranchChange = (newBranchId) => {
    setCurrentBranchId(newBranchId)
    navigate(`/dashboard/${newBranchId}`)
  }

  const handleRunAnalysis = async () => {
    setIsLoading(true)
    setLoadingStep(0)
    
    const interval = setInterval(() => {
      setLoadingStep(prev => prev + 1)
    }, 700)
    
    setTimeout(() => {
      clearInterval(interval)
      setIsLoading(false)
      setLoadingStep(0)
      setIncidents(generateIncidents(currentBranchId))
    }, 2100)
  }

  const handleFilterChange = (category, value) => {
    if (category === 'reset') {
      setFilters({
        severity: { critical: false, high: false, medium: false, low: false },
        evidence: { E1: false, E2: false, E3: false },
        confidence: { high: false, medium: false, low: false }
      })
    } else {
      setFilters(prev => ({
        ...prev,
        [category]: { ...prev[category], [value]: !prev[category][value] }
      }))
    }
  }

  const filteredIncidents = incidents.filter(incident => {
    const hasActiveFilters = Object.values(filters).some(cat => Object.values(cat).some(v => v))
    if (!hasActiveFilters) return true
    
    return (
      (!Object.values(filters.severity).some(v => v) || filters.severity[incident.severity]) &&
      (!Object.values(filters.evidence).some(v => v) || filters.evidence[incident.evidence]) &&
      (!Object.values(filters.confidence).some(v => v) || filters.confidence[incident.confidence])
    )
  })

  const incidentCounts = {
    critical: incidents.filter(i => i.severity === 'critical').length,
    high: incidents.filter(i => i.severity === 'high').length,
    medium: incidents.filter(i => i.severity === 'medium').length,
    low: incidents.filter(i => i.severity === 'low').length,
  }

  const getSeverityColor = (severity) => {
    const colors = { critical: '#E53E3E', high: '#DD6B20', medium: '#D69E2E', low: '#ECC94B' }
    return colors[severity]
  }

  if (!branch) return <div>Branch not found</div>

  return (
    <div className="dashboard">
      <Header 
        selectedBranch={currentBranchId} 
        onBranchChange={handleBranchChange}
        onRunAnalysis={handleRunAnalysis}
        isLoading={isLoading}
        loadingStep={loadingStep}
        loadingSteps={loadingSteps}
      />

      <div className="dashboard-layout">
        <CollapsibleSidebar 
          selectedBranch={currentBranchId}
          credits={branch?.credits || 0}
          emissions={branch?.emissions || []}
          filters={filters}
          onFilterChange={handleFilterChange}
          incidentCounts={incidentCounts}
        />

        <main className="map-area">
          
          {isLoading ? (
            <div className="loading-overlay">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>{loadingSteps[loadingStep]}</p>
              </div>
            </div>
          ) : (
            <MapContainer center={[branch.lat, branch.lng]} zoom={7} className="map">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {filteredIncidents.map(incident => (
                <CircleMarker
                  key={incident.id}
                  center={[incident.lat, incident.lng]}
                  radius={15}
                  fillColor={getSeverityColor(incident.severity)}
                  color="#fff"
                  weight={2}
                  fillOpacity={0.7}
                >
                  <Popup>
                    <strong>Severity:</strong> {incident.severity}<br/>
                    <strong>Confidence:</strong> {incident.confidence}<br/>
                    <strong>Evidence:</strong> {incident.evidence}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )}

          <div className="timeline">
            <span>📅 10/01/2025 – 23/11/2025</span>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
