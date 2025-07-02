import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../utils/api'

function CatalogModal({ onClose, onConcertSelect }) {
  const [concerts, setConcerts] = useState([])
  const [filteredConcerts, setFilteredConcerts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedType, setSelectedType] = useState('attended')
  const scrollContainerRef = useRef(null)
  const observerRef = useRef(null)

  // Load concerts on mount and when tab changes
  useEffect(() => {
    setPage(1)
    setConcerts([])
    loadConcerts()
  }, [selectedType])

  // Filter concerts based on search query and selected tab
  useEffect(() => {
    let filtered = [...concerts]
    
    // Filter by date based on selected tab
    const now = new Date()
    if (selectedType === 'wishlist') {
      // Wishlist: only future concerts
      filtered = filtered.filter(concert => new Date(concert.date) > now)
    } else if (selectedType === 'attended' || selectedType === 'favorites') {
      // Attended and Favorites: only past concerts
      filtered = filtered.filter(concert => new Date(concert.date) <= now)
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter(concert => {
        return (
          concert.artist?.toLowerCase().includes(searchLower) ||
          concert.venue?.toLowerCase().includes(searchLower) ||
          concert.tour?.toLowerCase().includes(searchLower) ||
          concert.city?.toLowerCase().includes(searchLower)
        )
      })
    }
    
    setFilteredConcerts(filtered)
  }, [searchQuery, concerts, selectedType])

  // Intersection Observer for infinite scroll
  const lastConcertRef = useCallback(node => {
    if (loading) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1)
      }
    })
    
    if (node) observerRef.current.observe(node)
  }, [loading, hasMore])

  const loadConcerts = async () => {
    setLoading(true)
    try {
      // For wishlist, we want to search all concerts (including upcoming ones)
      // For attended/favorites, we can use saved events
      const endpoint = selectedType === 'wishlist' 
        ? `/api/events?page=${page}&per_page=20&save=true&from_date=${new Date().toISOString().split('T')[0]}`
        : `/api/saved-events?page=${page}&limit=20`
        
      const response = await api.get(endpoint)
      console.log(`${selectedType} concerts API response:`, response.data)
      
      // Handle different response formats
      const events = response.data.events || []
      console.log('Raw events from API:', events[0]) // Debug first event
      
      // Transform events to our format
      const transformedEvents = events.map(event => {
        // For wishlist (from SeatGeek API), event structure is different
        const transformed = {
          _id: event._id,  // May be undefined for SeatGeek events
          artist: event.performers?.[0]?.name || event.title,
          tour: event.title,
          venue: typeof event.venue === 'string' ? event.venue : event.venue?.name || '',
          city: event.venue?.city || '',
          date: event.datetime_local,
          poster: event.performers?.[0]?.image || null,
          seatgeekId: event.seatgeekId || event.id,  // SeatGeek API uses 'id'
          // Store full event data for later use
          fullEvent: event
        }
        
        // Ensure we have required fields for venue
        if (typeof event.venue === 'object') {
          transformed.fullEvent.venue = event.venue
        }
        
        return transformed
      })
      
      if (page === 1) {
        setConcerts(transformedEvents)
      } else {
        setConcerts(prev => [...prev, ...transformedEvents])
      }
      
      // Check if there are more pages based on pagination data
      const pagination = response.data.pagination || {}
      setHasMore(page < (pagination.pages || 1))
    } catch (error) {
      console.error('Error loading concerts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load more concerts when page changes
  useEffect(() => {
    if (page > 1) {
      loadConcerts()
    }
  }, [page, selectedType])

  const handleConcertSelect = (concert) => {
    onConcertSelect(concert, selectedType)
    onClose()
  }

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320 // Width of one concert card plus gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-secondary rounded-lg w-full max-w-6xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-primary">Concert Catalog</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-primary transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by artist, venue, tour, or city..."
              className="w-full px-4 py-3 pl-10 bg-gray-800 text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Type Selection */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType('attended')}
              className={`px-4 py-2 rounded-lg transition ${
                selectedType === 'attended' 
                  ? 'bg-primary text-secondary' 
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-primary'
              }`}
            >
              Attended
            </button>
            <button
              onClick={() => setSelectedType('wishlist')}
              className={`px-4 py-2 rounded-lg transition ${
                selectedType === 'wishlist' 
                  ? 'bg-primary text-secondary' 
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-primary'
              }`}
            >
              Wishlist
            </button>
            <button
              onClick={() => setSelectedType('favorites')}
              className={`px-4 py-2 rounded-lg transition ${
                selectedType === 'favorites' 
                  ? 'bg-primary text-secondary' 
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-primary'
              }`}
            >
              Favorites
            </button>
          </div>
        </div>

        {/* Concert List - Horizontal Scroll */}
        <div className="relative flex-1 p-6">
          {/* Left Scroll Button */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-gray-800 bg-opacity-90 text-primary p-2 rounded-full hover:bg-opacity-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Scroll Button */}
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-gray-800 bg-opacity-90 text-primary p-2 rounded-full hover:bg-opacity-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Concert Cards Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredConcerts.map((concert, index) => (
              <div
                key={concert._id}
                ref={index === filteredConcerts.length - 1 ? lastConcertRef : null}
                className="flex-shrink-0 w-80 bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition"
                onClick={() => handleConcertSelect(concert)}
              >
                {concert.poster && (
                  <img
                    src={concert.poster}
                    alt={concert.artist}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-primary mb-1">{concert.artist}</h3>
                  <p className="text-gray-400 text-sm mb-2">{concert.tour}</p>
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {concert.venue}, {concert.city}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(concert.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex-shrink-0 w-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          {filteredConcerts.length === 0 && !loading && (
            <div className="text-center text-gray-400 mt-8">
              {searchQuery ? (
                'No concerts found matching your search.'
              ) : selectedType === 'wishlist' ? (
                'No upcoming concerts available. Only future concerts can be added to wishlist.'
              ) : selectedType === 'attended' ? (
                'No past concerts available. Only past concerts can be marked as attended.'
              ) : selectedType === 'favorites' ? (
                'No past concerts available. Only past concerts can be added to favorites.'
              ) : (
                'No concerts available.'
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CatalogModal