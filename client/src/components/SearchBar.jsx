import React, { useState } from 'react'

const SearchBar = ({ onSearch, onFilterChange }) => {
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

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
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
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className="search-container">
      <div className="search-bar-wrapper">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search by artist, tour, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              🔍
            </button>
          </div>
        </form>
        
        <button 
          className={`filter-toggle ${showFilters ? 'active' : ''} ${hasActiveFilters ? 'has-filters' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters {hasActiveFilters && '●'}
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                placeholder="Enter city name"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="artist">Artist</label>
              <input
                type="text"
                id="artist"
                placeholder="Enter artist name"
                value={filters.artist}
                onChange={(e) => handleFilterChange('artist', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="from_date">From Date</label>
              <input
                type="date"
                id="from_date"
                value={filters.from_date}
                onChange={(e) => handleFilterChange('from_date', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="to_date">To Date</label>
              <input
                type="date"
                id="to_date"
                value={filters.to_date}
                onChange={(e) => handleFilterChange('to_date', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="min_price">Min Price ($)</label>
              <input
                type="number"
                id="min_price"
                placeholder="0"
                min="0"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="max_price">Max Price ($)</label>
              <input
                type="number"
                id="max_price"
                placeholder="1000"
                min="0"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-actions">
            <button 
              type="button" 
              onClick={clearFilters}
              className="clear-filters-btn"
              disabled={!hasActiveFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar