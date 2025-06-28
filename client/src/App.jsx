import { AuthProvider } from './context/AuthContext'
import LandingPage from './components/LandingPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <LandingPage />
      </div>
    </AuthProvider>
  )
}

export default App
