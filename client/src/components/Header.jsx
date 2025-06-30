import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import LoginModal from './LoginModal'
import FilterModal from './FilterModal'

const Header = ({ onSearch, onFilterChange, onLogoClick }) => {
  const { user } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [modalMode, setModalMode] = useState('login')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filters, setFilters] = useState({
    city: '',
    from_date: '',
    to_date: ''
  })

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error logging out:', error)
      // Even if logout fails, clear local state
      localStorage.removeItem('access_token')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    // Don't apply filters immediately, wait for Apply button
  }

  const applyFilters = () => {
    onFilterChange && onFilterChange(filters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      city: '',
      from_date: '',
      to_date: ''
    }
    setFilters(clearedFilters)
    onFilterChange && onFilterChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <>
      <header className="bg-gray-900 text-primary py-3 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div 
              className="logo flex items-center space-x-2 cursor-pointer" 
              onClick={onLogoClick}
            >
              <img src="/Setlistd.png" alt="Setlistd Logo" className="h-10 w-10" />
              <h1 className="text-3xl font-bold">Setlistd</h1>
            </div>
            
            {/* Center Navigation/Auth and Search */}
            <div className="flex items-center space-x-6">
              {user ? (
                <>
                  <span className="text-sm">Welcome, {user.user_metadata?.username || user.email}</span>
                  <button onClick={handleLogout} className="bg-primary text-secondary px-4 py-2 rounded hover:bg-primary-dark">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setModalMode('login')
                      setShowLoginModal(true)
                    }} 
                    className="text-primary hover:text-primary-dark"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => {
                      setModalMode('signup')
                      setShowLoginModal(true)
                    }} 
                    className="text-primary hover:text-primary-dark"
                  >
                    Create Account
                  </button>
                </>
              )}
              
              {/* Compact Search */}
              <div className="flex items-center space-x-2">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search concerts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(e)
                      }
                    }}
                    className="w-64 bg-gray-800 text-white pl-4 pr-10 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button type="submit" className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-primary rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </form>
                
                <button 
                  className={`relative p-2 rounded-full hover:bg-gray-800 ${showFilterModal ? 'bg-gray-800 text-white' : 'text-primary'} ${hasActiveFilters ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setShowFilterModal(true)}
                  title="Open Filters"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.707 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {hasActiveFilters && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>}
                </button>
              </div>
            </div>
          </div>

        </div>
      </header>
      
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          initialMode={modalMode}
        />
      )}
      
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={applyFilters}
      />
    </>
  )
}

export default Header