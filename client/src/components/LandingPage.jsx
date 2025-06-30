import React, { useState, useEffect, useCallback } from 'react'
import Header from './Header'
import ConcertCard from './ConcertCard'
import Footer from './Footer'
import TextRotator from './TextRotator'
import { eventsAPI } from '../utils/api'

const LandingPage = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  // Helper function to map filter object to API parameters
  const mapFiltersToParams = (filterObj) => {
    const filterParams = {}
    if (filterObj.city && filterObj.city.trim()) {
      filterParams.city = filterObj.city.trim()
    }
    if (filterObj.from_date && filterObj.from_date.trim()) {
      filterParams.from_date = filterObj.from_date.trim()
    }
    if (filterObj.to_date && filterObj.to_date.trim()) {
      filterParams.to_date = filterObj.to_date.trim()
    }
    return filterParams
  }

  const fetchEvents = useCallback(async (query = '', filterParams = {}, page = 1) => {
    setLoading(true)
    setError('')
    
    try {
      const params = {
        page,
        per_page: pagination.limit,
        save: 'true', // Ensure events are saved to the database
        ...filterParams
      }

      // If there's a search query, add it to the params
      if (query.trim()) {
        params.q = query
      } else {
        // Default search query if none provided
        params.q = 'concert'
      }

      
      console.log('Fetching events with params:', params)
      console.log('Query:', query)
      console.log('Filter params:', filterParams)

     
      const response = await eventsAPI.searchEvents(params)
      setEvents(response.data.events || [])
      
      // Handle SeatGeek API pagination format
      const meta = response.data.meta || {}
      setPagination({
        page: Number(page),
        limit: pagination.limit,
        total: meta.total || 0,
        pages: Math.ceil((meta.total || 0) / pagination.limit)
      })
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [pagination.limit])

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleSearch = (query) => {
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, page: 1 }))
    
    const filterParams = mapFiltersToParams(filters)
    fetchEvents(query, filterParams, 1)
  }

  const handleFilterChange = (newFilters) => {
    console.log('Filter change received:', newFilters)
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
    
    const filterParams = mapFiltersToParams(newFilters)
    console.log('Mapped filter params:', filterParams)
    fetchEvents(searchQuery, filterParams, 1)
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    
    const filterParams = mapFiltersToParams(filters)
    fetchEvents(searchQuery, filterParams, newPage)
  }

  const renderPagination = () => {
    if (pagination.pages <= 1) return null

    const pages = []
    const maxPages = 5
    let startPage = Math.max(1, pagination.page - Math.floor(maxPages / 2))
    let endPage = Math.min(pagination.pages, startPage + maxPages - 1)

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1)
    }

    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => handlePageChange(1)} className="bg-primary text-secondary px-4 py-2 rounded mx-1 hover:bg-pink-700">
          1
        </button>
      )
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis" className="mx-1">...</span>)
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded mx-1 ${pagination.page === i ? 'bg-pink-700 text-white' : 'bg-primary text-secondary hover:bg-pink-700'}`}
        >
          {i}
        </button>
      )
    }

    if (endPage < pagination.pages) {
      if (endPage < pagination.pages - 1) {
        pages.push(<span key="end-ellipsis" className="mx-1">...</span>)
      }
      pages.push(
        <button 
          key={pagination.pages} 
          onClick={() => handlePageChange(pagination.pages)}
          className="bg-primary text-secondary px-4 py-2 rounded mx-1 hover:bg-pink-700"
        >
          {pagination.pages}
        </button>
      )
    }

    return (
      <div className="flex justify-center items-center my-8">
        <button 
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="bg-primary text-secondary px-4 py-2 rounded mx-1 hover:bg-pink-700 disabled:opacity-50"
        >
          Previous
        </button>
        {pages}
        <button 
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.pages}
          className="bg-primary text-secondary px-4 py-2 rounded mx-1 hover:bg-pink-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div className="bg-secondary min-h-screen">
      <Header 
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
      
      <main className="container mx-auto px-4 py-6">
        {searchQuery === '' && pagination.page === 1 && !Object.values(filters).some(value => value !== '') && (
          <div className="relative text-center my-8">
            <img 
              src="/landingPAGE.webp" 
              alt="Landing page illustration" 
              className="w-full max-w-4xl mx-auto opacity-70 h-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-6xl font-bold text-primary mb-2"><TextRotator /></h1>
            </div>
            <p className="text-xs text-gray-500 mt-2">Image credit: LE SSERAFIM / SOURCE MUSIC</p>
          </div>
        )}

        <div>
          {loading && (
            <div className="text-center">
              <p className="text-primary">Loading concerts...</p>
            </div>
          )}

          {error && (
            <div className="text-center text-red-500">
              <p>{error}</p>
              <button onClick={() => {
                const filterParams = mapFiltersToParams(filters)
                fetchEvents(searchQuery, filterParams, pagination.page)
              }} className="bg-primary text-secondary px-4 py-2 rounded mt-4 hover:bg-pink-700">
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="text-center text-gray-400">
              <p>No concerts found matching your criteria.</p>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {events.map((event) => (
                  <ConcertCard key={event._id || event.seatgeekId} event={event} />
                ))}
              </div>
              
              {renderPagination()}
              
              <div className="text-center text-gray-400 mt-8">
                <p>
                  Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} concerts
                </p>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default LandingPage