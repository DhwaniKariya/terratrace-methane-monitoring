import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { format } from 'date-fns'
import { branches, generateIncidents } from '../data/mockData'
import { generateRecommendations } from '../data/decisionsData'
import { generateForecasts, generateRiskTrend } from '../data/forecastData'
import { generateVerifications } from '../data/verificationData'
import Header from '../components/Header'
import CollapsibleSidebar from '../components/CollapsibleSidebar'
import SuperEmitterPanel from '../components/panels/SuperEmitterPanel'
import ExecutiveCommandCenter from '../components/panels/ExecutiveCommandCenter'
import DecisionEngine from '../components/panels/DecisionEngine'
import RiskForecast from '../components/panels/RiskForecast'
import VerificationEngine from '../components/panels/VerificationEngine'
import ExplainableAI from '../components/panels/ExplainableAI'
import ComplianceGovernance from '../components/panels/ComplianceGovernance'
import IntelligenceNetwork from '../components/panels/IntelligenceNetwork'
import CarbonCreditExchange from '../components/panels/CarbonCreditExchange'
import DataPipeline from '../components/panels/DataPipeline'
import '../styles/Dashboard.css'

const TABS = [
  { id: 'data', label: 'Data Pipeline' },
  { id: 'map', label: 'Map & Events' },
  { id: 'overview', label: 'Overview' },
  { id: 'forecast', label: 'Forecast' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'verification', label: 'Verification' },
  { id: 'exai', label: 'Ex-AI' },
  { id: 'compliance', label: 'Regulatory & Ethical Compliance' },
  { id: 'network', label: 'Network' },
  { id: 'exchange', label: 'Carbon Exchange' },
]

// react-leaflet's MapContainer only applies center/zoom on mount, so switching
// branches without this leaves the map stuck on the previous location.
//
// On mobile, the super-emitter list docks as a bottom sheet over the map. Since
// incidents are generated as a tight cluster around the branch's own coordinates,
// the true geographic center - right where the map centers by default - is
// exactly where that cluster sits. Left alone, the sheet would hide it on every
// single branch. Shifting the visual center up (via project/unproject, since
// setView has no pixel-offset option) keeps the cluster inside the visible strip
// above the sheet instead.
function RecenterOnBranchChange({ lat, lng, zoom, hasBottomSheet }) {
  const map = useMap()
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 640px)').matches
    if (hasBottomSheet && isMobile) {
      const size = map.getSize()
      const centerPoint = map.project([lat, lng], zoom)
      const shiftedPoint = centerPoint.add([0, size.y * 0.19])
      map.setView(map.unproject(shiftedPoint, zoom), zoom, { animate: false })
    } else {
      map.setView([lat, lng], zoom, { animate: false })
    }
  }, [lat, lng, zoom, hasBottomSheet, map])
  return null
}

function Dashboard() {
  const { branchId } = useParams()
  const navigate = useNavigate()
  const [currentBranchId, setCurrentBranchId] = useState(parseInt(branchId))
  const branch = branches.find(b => b.id === currentBranchId)
  const [incidents, setIncidents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [activeTab, setActiveTab] = useState('data')
  const [filters, setFilters] = useState({
    severity: { critical: false, high: false, medium: false, low: false },
    evidence: { E1: false, E2: false, E3: false },
    confidence: { high: false, medium: false, low: false }
  })

  const loadingSteps = ['Getting info from satellite...', 'Trying to find leaks...', 'Prioritizing...']

  useEffect(() => {
    setCurrentBranchId(parseInt(branchId))
  }, [branchId])

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

  // Derived data for the newer panels - all deterministic functions of the
  // branch, so they stay in sync with whatever `incidents` currently holds.
  const recommendations = generateRecommendations(currentBranchId)
  const forecasts = generateForecasts(currentBranchId)
  const riskTrend = generateRiskTrend(currentBranchId)
  const verifications = generateVerifications(currentBranchId)

  return (
    <div className="dashboard">
      <Header
        selectedBranch={currentBranchId}
        onBranchChange={handleBranchChange}
        onRunAnalysis={handleRunAnalysis}
        isLoading={isLoading}
        loadingStep={loadingStep}
        loadingSteps={loadingSteps}
        activeTab={activeTab}
      />

      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-layout">
        {activeTab === 'map' && (
          <CollapsibleSidebar
            selectedBranch={currentBranchId}
            credits={branch?.credits || 0}
            emissions={branch?.emissions || []}
            filters={filters}
            onFilterChange={handleFilterChange}
            incidentCounts={incidentCounts}
          />
        )}

        <main className="map-area">
          {activeTab === 'overview' && (
            <ExecutiveCommandCenter
              branch={branch}
              incidents={incidents}
              forecasts={forecasts}
              verifications={verifications}
            />
          )}

          {activeTab === 'decisions' && (
            <DecisionEngine recommendations={recommendations} />
          )}

          {activeTab === 'forecast' && (
            <RiskForecast forecasts={forecasts} riskTrend={riskTrend} />
          )}

          {activeTab === 'verification' && (
            <VerificationEngine verifications={verifications} />
          )}

          {activeTab === 'exai' && (
            <ExplainableAI branchId={currentBranchId} />
          )}

          {activeTab === 'compliance' && (
            <ComplianceGovernance branchId={currentBranchId} />
          )}

          {activeTab === 'network' && (
            <IntelligenceNetwork />
          )}

          {activeTab === 'exchange' && (
            <CarbonCreditExchange />
          )}

          {activeTab === 'data' && (
            <DataPipeline branchId={currentBranchId} />
          )}

          {activeTab === 'map' && (
            <>
              {isLoading ? (
                <div className="loading-overlay">
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>{loadingSteps[loadingStep]}</p>
                  </div>
                </div>
              ) : (
                <MapContainer center={[branch.lat, branch.lng]} zoom={7} className="map">
                  <RecenterOnBranchChange
                    lat={branch.lat}
                    lng={branch.lng}
                    zoom={7}
                    hasBottomSheet={filteredIncidents.some(i => i.superEmitter)}
                  />
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
                        <strong>{incident.assetId}</strong> - {incident.equipmentType}<br/>
                        <strong>Detected:</strong> {format(new Date(incident.timestamp), 'dd MMM yyyy HH:mm')} UTC<br/>
                        <strong>Event type:</strong> {incident.eventType}<br/>
                        <strong>CH4 rate:</strong> {incident.ch4Rate} kg/hr<br/>
                        <strong>Leak volume:</strong> {incident.leakVolume} t (over {incident.durationHours}h)<br/>
                        <strong>Detection source:</strong> {incident.detectionSource}<br/>
                        <strong>Severity:</strong> {incident.severity}<br/>
                        <strong>Confidence:</strong> {incident.confidence}<br/>
                        <strong>Evidence:</strong> {incident.evidence}
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              )}

              <SuperEmitterPanel incidents={filteredIncidents} />

              <div className="timeline">
                <span>📅 10/01/2025 – 23/11/2025</span>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
