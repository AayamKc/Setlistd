import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import LoginModal from './LoginModal'

const Header = () => {
  const { user } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error logging out:', error)
      // Even if logout fails, clear local state
      localStorage.removeItem('access_token')
    }
  }

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <h1>Setlisd</h1>
          </div>
          <div className="auth-section">
            {user ? (
              <div className="user-menu">
                <span className="user-name">Welcome, {user.email}</span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)} 
                className="login-btn"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>
      
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  )
}

export default Header