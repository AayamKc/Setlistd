import { AuthProvider } from './context/AuthContext'
import LandingPage from './components/LandingPage'
import UserProfile from './components/UserProfile'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Chatbot from './components/Chatbot'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-secondary text-primary">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/user/:username" element={<UserProfile />} />
          </Routes>
          <Chatbot />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
