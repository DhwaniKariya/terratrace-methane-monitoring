import { useNavigate, useLocation } from 'react-router-dom'
import { branches } from '../data/mockData'
import '../styles/Header.css'
import logo from '../assets/logo.png'

function Header({ selectedBranch, onBranchChange, onRunAnalysis, isLoading, loadingStep, loadingSteps, activeTab }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isDashboard = location.pathname.includes('/dashboard/')

  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="TerraTrace Logo" className="logo-img"/>
        <h1>TerraTrace</h1>
      </div>
      <div className="header-center">
        <select
          className="dropdown"
          value={selectedBranch || branches[0].id}
          onChange={(e) => onBranchChange && onBranchChange(parseInt(e.target.value))}
        >
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        {isDashboard && (
          <>
            {activeTab !== 'map' && (
              <button className="run-analysis-btn" onClick={onRunAnalysis} disabled={isLoading}>
                {isLoading ? loadingSteps[loadingStep] : '▶ Run Analysis'}
              </button>
            )}
            <button className="back-btn" onClick={() => navigate('/')}>← All Branches</button>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
