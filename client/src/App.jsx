import { AuthProvider } from './context/AuthContext'
import LandingPage from './components/LandingPage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-secondary text-primary">
          <Routes>
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
