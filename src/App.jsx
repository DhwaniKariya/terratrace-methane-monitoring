import { HashRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard/:branchId" element={<Dashboard />} />
      </Routes>
    </HashRouter>
  )
}

export default App
