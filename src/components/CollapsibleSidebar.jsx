import { useState } from 'react'
import '../styles/CollapsibleSidebar.css'

function CollapsibleSidebar({ selectedBranch, credits, emissions, filters, onFilterChange, incidentCounts }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    filters: true,
    credits: true,
    emissions: true
  })

  const toggleSidebar = () => setIsExpanded(!isExpanded)

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const toggleFilter = (category, value) => {
    onFilterChange(category, value)
  }

  const resetFilters = () => {
    onFilterChange('reset')
  }

  // Calculate pie chart segments for emissions
  const total = emissions.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = 0
  const segments = emissions.map((item) => {
    const percentage = (item.value / total) * 100
    const angle = (percentage / 100) * 360
    const startAngle = currentAngle
    currentAngle += angle
    return { ...item, startAngle, angle, percentage }
  })

  const createPieSlice = (startAngle, angle, color) => {
    const radius = 50
    const cx = 60
    const cy = 60
    
    const startRad = (startAngle - 90) * Math.PI / 180
    const endRad = (startAngle + angle - 90) * Math.PI / 180
    
    const x1 = cx + radius * Math.cos(startRad)
    const y1 = cy + radius * Math.sin(startRad)
    const x2 = cx + radius * Math.cos(endRad)
    const y2 = cy + radius * Math.sin(endRad)
    
    const largeArc = angle > 180 ? 1 : 0
    
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
  }

  return (
    <aside className={`collapsible-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button className="expand-arrow" onClick={toggleSidebar}>
        {isExpanded ? '←' : '→'}
      </button>

      <div className="sidebar-content">
        {!isExpanded ? (
          <div className="collapsed-view">
            <div className="icon-item">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="#4318FF" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="2" cy="6" r="1" fill="#4318FF"/>
                <circle cx="2" cy="12" r="1" fill="#4318FF"/>
                <circle cx="2" cy="18" r="1" fill="#4318FF"/>
              </svg>
            </div>
            
            <div className="icon-item">
              <span className="symbol-icon">%</span>
            </div>
            
            <div className="icon-item">
              <span className="symbol-icon">📊</span>
            </div>
          </div>
        ) : (
          <div className="expanded-view">
            
            <div className="section">
              <div className="section-header" onClick={() => toggleSection('filters')}>
                <div className="section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke="#4318FF" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="2" cy="6" r="1" fill="#4318FF"/>
                    <circle cx="2" cy="12" r="1" fill="#4318FF"/>
                    <circle cx="2" cy="18" r="1" fill="#4318FF"/>
                  </svg>
                  <h3>Filters</h3>
                </div>
                <div className="section-controls">
                  <button className="reset-btn-small" onClick={(e) => { e.stopPropagation(); resetFilters(); }}>Reset</button>
                  <span className="dropdown-arrow">{expandedSections.filters ? '▼' : '▶'}</span>
                </div>
              </div>
              
              {expandedSections.filters && (
                <div className="filter-content">
                  <div className="filter-group">
                    <h4>Severity</h4>
                    {['critical', 'high', 'medium', 'low'].map(level => (
                      <label key={level} className="filter-item">
                        <input 
                          type="checkbox" 
                          checked={filters.severity[level] || false} 
                          onChange={() => toggleFilter('severity', level)} 
                        />
                        <span className={`severity-badge ${level}`}>{level}</span>
                        <span className="count">{incidentCounts[level] || 0}</span>
                      </label>
                    ))}
                  </div>

                  <div className="filter-group">
                    <h4>Evidence tier</h4>
                    {['E1', 'E2', 'E3'].map(tier => (
                      <label key={tier} className="filter-item">
                        <input 
                          type="checkbox" 
                          checked={filters.evidence[tier] || false} 
                          onChange={() => toggleFilter('evidence', tier)} 
                        />
                        <span>{tier} - {tier === 'E1' ? 'High' : tier === 'E2' ? 'Medium' : 'Low'}</span>
                      </label>
                    ))}
                  </div>

                  <div className="filter-group">
                    <h4>Assignment confidence</h4>
                    {['high', 'medium', 'low'].map(conf => (
                      <label key={conf} className="filter-item">
                        <input 
                          type="checkbox" 
                          checked={filters.confidence[conf] || false} 
                          onChange={() => toggleFilter('confidence', conf)} 
                        />
                        <span>{conf}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="section">
              <div className="section-header" onClick={() => toggleSection('credits')}>
                <div className="section-title">
                  <span className="section-icon">%</span>
                  <h3>Credits</h3>
                </div>
                <span className="dropdown-arrow">{expandedSections.credits ? '▼' : '▶'}</span>
              </div>
              
              {expandedSections.credits && (
                <div className="credit-display">
                  <div className="credit-amount">
                    <span className="percent">%</span>
                    <span className="value">{credits}</span>
                  </div>
                  <div className="credit-info">
                    <span>Weekly limit: 100</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(credits / 100) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="section">
              <div className="section-header" onClick={() => toggleSection('emissions')}>
                <div className="section-title">
                  <span className="section-icon">📊</span>
                  <h3>Emission Summary</h3>
                </div>
                <span className="dropdown-arrow">{expandedSections.emissions ? '▼' : '▶'}</span>
              </div>
              
              {expandedSections.emissions && (
                <div className="pie-chart-container">
                  <svg width="200" height="200" viewBox="0 0 120 120">
                    {segments.map((seg, i) => (
                      <path
                        key={i}
                        d={createPieSlice(seg.startAngle, seg.angle, seg.color)}
                        fill={seg.color}
                      />
                    ))}
                  </svg>
                  <div className="legend">
                    {emissions.map((item, i) => (
                      <div key={i} className="legend-item">
                        <span className="legend-color" style={{ background: item.color }}></span>
                        <span className="legend-label">{item.label}</span>
                        <span className="legend-value">{item.value}/10</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export default CollapsibleSidebar
