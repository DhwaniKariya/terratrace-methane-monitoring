import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { branches } from '../data/mockData'
import Header from '../components/Header'
import '../styles/HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  const [selectedBranch, setSelectedBranch] = useState(branches[0].id)

  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId)
  }

  return (
    <div className="home-page">
      <Header 
        selectedBranch={selectedBranch} 
        onBranchChange={handleBranchChange}
      />

      <main className="main-content">
        <h2>Branch Locations</h2>
        <p className="subtitle">Select a branch to view methane monitoring dashboard</p>
        
        <div className="branch-grid">
          {branches.map(branch => (
            <div 
              key={branch.id} 
              className="branch-card"
              onClick={() => navigate(`/dashboard/${branch.id}`)}
            >
              <div className="branch-image-container">
                <img src={branch.image} alt={branch.name} className="branch-image" onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=' + branch.name} />
              </div>
              <div className="card-body">
                <div className="card-header">
                  <h3>{branch.name}</h3>
                  <span className={`badge ${branch.incidents > 30 ? 'critical' : 'normal'}`}>
                    {branch.incidents} incidents
                  </span>
                </div>
                <p className="location">{branch.location}</p>
                <div className="card-footer">
                  <span>Real-time monitoring active</span>
                  <button className="view-btn">View Dashboard →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default HomePage
