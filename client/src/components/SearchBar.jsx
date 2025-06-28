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
    <div className="bg-secondary p-4 rounded-lg">
      <div className="flex items-center">
        <form onSubmit={handleSearch} className="flex-grow">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by artist, tour, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-l-md focus:outline-none"
            />
            <button type="submit" className="absolute right-0 top-0 bg-primary text-secondary px-4 py-2 rounded-r-md hover:bg-pink-700">
              🔍
            </button>
          </div>
        </form>
        
        <button 
          className={`ml-4 px-4 py-2 rounded-md ${showFilters ? 'bg-pink-700 text-white' : 'bg-primary text-secondary'} ${hasActiveFilters ? 'ring-2 ring-pink-500' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters {hasActiveFilters && '●'}
        </button>
      </div>

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
              className="bg-primary text-secondary px-4 py-2 rounded hover:bg-secondary disabled:opacity-50"
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