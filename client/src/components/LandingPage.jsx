import React, { useState, useEffect, useCallback } from 'react'
import Header from './Header'
import SearchBar from './SearchBar'
import ConcertCard from './ConcertCard'
import Footer from './Footer'
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

  const fetchEvents = useCallback(async (query = '', filterParams = {}, page = 1) => {
    setLoading(true)
    setError('')
    
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...filterParams
      }

      // If there's a search query, add it to the params
      if (query.trim()) {
        params.q = query
      }

      const response = await eventsAPI.getSavedEvents(params)
      setEvents(response.data.events || [])
      setPagination(response.data.pagination || pagination)
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
    fetchEvents(query, filters, 1)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchEvents(searchQuery, newFilters, 1)
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    fetchEvents(searchQuery, filters, newPage)
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
        <button key={1} onClick={() => handlePageChange(1)} className="page-btn">
          1
        </button>
      )
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis" className="ellipsis">...</span>)
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => handlePageChange(i)}
          className={`page-btn ${pagination.page === i ? 'active' : ''}`}
        >
          {i}
        </button>
      )
    }

    if (endPage < pagination.pages) {
      if (endPage < pagination.pages - 1) {
        pages.push(<span key="end-ellipsis" className="ellipsis">...</span>)
      }
      pages.push(
        <button 
          key={pagination.pages} 
          onClick={() => handlePageChange(pagination.pages)}
          className="page-btn"
        >
          {pagination.pages}
        </button>
      )
    }

    return (
      <div className="pagination">
        <button 
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="page-btn prev"
        >
          Previous
        </button>
        {pages}
        <button 
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.pages}
          className="page-btn next"
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div className="landing-page">
      <Header />
      
      <main className="main-content">
        <div className="hero-section">
          <div className="hero-content">
            <h1>Discover Amazing Concerts</h1>
            <p>Find concerts, read reviews, and share your live music experiences</p>
          </div>
        </div>

        <div className="search-section">
          <SearchBar 
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="events-section">
          {loading && (
            <div className="loading">
              <p>Loading concerts...</p>
            </div>
          )}

          {error && (
            <div className="error">
              <p>{error}</p>
              <button onClick={() => fetchEvents(searchQuery, filters, pagination.page)}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="no-results">
              <p>No concerts found matching your criteria.</p>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <>
              <div className="events-grid">
                {events.map((event) => (
                  <ConcertCard key={event._id || event.seatgeekId} event={event} />
                ))}
              </div>
              
              {renderPagination()}
              
              <div className="results-info">
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