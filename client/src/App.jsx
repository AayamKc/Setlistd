import { AuthProvider } from './context/AuthContext'
import LandingPage from './components/LandingPage'

function App() {
  return (
    <AuthProvider>
      <div className="bg-secondary text-primary">
        <LandingPage />
      </div>
    </AuthProvider>
  )
}

export default App
