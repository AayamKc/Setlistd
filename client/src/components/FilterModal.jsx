import React from 'react'

const FilterModal = ({ isOpen, onClose, filters, onFilterChange, onClearFilters, onApplyFilters }) => {
  if (!isOpen) return null

  const handleFilterChange = (key, value) => {
    onFilterChange(key, value)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 rounded-lg shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.707 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h2 className="text-2xl font-bold text-primary">Filter Events</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* City Filter */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <label className="text-lg font-semibold text-white">City</label>
            </div>
            <input
              type="text"
              placeholder="Enter city name"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <label className="text-lg font-semibold text-white">Date Range</label>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="date"
                value={filters.from_date}
                onChange={(e) => handleFilterChange('from_date', e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <input
                type="date"
                value={filters.to_date}
                onChange={(e) => handleFilterChange('to_date', e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex flex-col space-y-3 p-6 border-t border-gray-700">
          <button
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="w-full py-3 px-6 text-gray-400 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear Filters
          </button>
          <button
            onClick={() => {
              onApplyFilters()
              onClose()
            }}
            className="w-full py-3 px-6 bg-primary text-black rounded-lg hover:bg-primary-dark transition-colors font-semibold"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterModal