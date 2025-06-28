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
      <header className="bg-secondary text-primary py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="logo">
            <h1 className="text-2xl font-bold">Setlisd</h1>
          </div>
          <div className="auth-section">
            {user ? (
              <div className="flex items-center">
                <span className="mr-4">Welcome, {user.email}</span>
                <button onClick={handleLogout} className="bg-primary text-secondary px-4 py-2 rounded hover:bg-pink-700">
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)} 
                className="bg-primary text-secondary px-4 py-2 rounded hover:bg-pink-700"
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