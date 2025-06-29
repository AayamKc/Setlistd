import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import LoginModal from './LoginModal'

const Header = ({ onSearch, onFilterChange }) => {
  const { user } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [modalMode, setModalMode] = useState('login')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    city: '',
    artist: '',
    from_date: '',
    to_date: '',
    min_price: '',
    max_price: ''
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
    onFilterChange && onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      city: '',
      artist: '',
      from_date: '',
      to_date: '',
      min_price: '',
      max_price: ''
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
            <div className="logo">
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
                  className={`p-2 rounded-full hover:bg-gray-800 ${showFilters ? 'bg-gray-800 text-white' : 'text-primary'} ${hasActiveFilters ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setShowFilters(!showFilters)}
                  title="Toggle Filters"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.707 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {hasActiveFilters && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>}
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="filter-group">
                  <label htmlFor="city" className="block text-sm font-medium text-primary">City</label>
                  <input
                    type="text"
                    id="city"
                    placeholder="Enter city name"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded mt-1"
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="artist" className="block text-sm font-medium text-primary">Artist</label>
                  <input
                    type="text"
                    id="artist"
                    placeholder="Enter artist name"
                    value={filters.artist}
                    onChange={(e) => handleFilterChange('artist', e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded mt-1"
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="from_date" className="block text-sm font-medium text-primary">From Date</label>
                  <input
                    type="date"
                    id="from_date"
                    value={filters.from_date}
                    onChange={(e) => handleFilterChange('from_date', e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded mt-1"
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="to_date" className="block text-sm font-medium text-primary">To Date</label>
                  <input
                    type="date"
                    id="to_date"
                    value={filters.to_date}
                    onChange={(e) => handleFilterChange('to_date', e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded mt-1"
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="min_price" className="block text-sm font-medium text-primary">Min Price ($)</label>
                  <input
                    type="number"
                    id="min_price"
                    placeholder="0"
                    min="0"
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded mt-1"
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="max_price" className="block text-sm font-medium text-primary">Max Price ($)</label>
                  <input
                    type="number"
                    id="max_price"
                    placeholder="1000"
                    min="0"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded mt-1"
                  />
                </div>
              </div>

              <div className="mt-4">
                <button 
                  type="button" 
                  onClick={clearFilters}
                  className="bg-primary text-secondary px-4 py-2 rounded hover:bg-primary-dark disabled:opacity-50"
                  disabled={!hasActiveFilters}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          initialMode={modalMode}
        />
      )}
    </>
  )
}

export default Header