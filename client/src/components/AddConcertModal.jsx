import { useState, useEffect } from 'react'
import api from '../utils/api'

function AddConcertModal({ type, onClose, onAdd }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [concerts, setConcerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedConcert, setSelectedConcert] = useState(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchConcerts()
  }, [])

  const fetchConcerts = async (query = '') => {
    try {
      setLoading(true)
      const response = await api.get('/api/saved-events', {
        params: {
          limit: 50,
          ...(query && { q: query })
        }
      })
      setConcerts(response.data.events)
    } catch (error) {
      console.error('Error fetching concerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchConcerts(searchQuery)
  }

  const handleAdd = async () => {
    if (!selectedConcert) return

    setAdding(true)
    try {
      await api.post(`/api/users/concerts/${type}/${selectedConcert._id}`)
      onAdd(selectedConcert, type)
      onClose()
    } catch (error) {
      console.error('Error adding concert:', error)
      if (error.response?.data?.message) {
        alert(error.response.data.message)
      }
    } finally {
      setAdding(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-primary">
              Add to {type.charAt(0).toUpperCase() + type.slice(1)}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-primary transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concerts..."
              className="flex-1 px-4 py-2 bg-gray-800 text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-accent text-secondary rounded-lg hover:bg-opacity-90 transition"
            >
              Search
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading concerts...</div>
            </div>
          ) : concerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">No concerts found</div>
            </div>
          ) : (
            <div className="space-y-2">
              {concerts.map((concert) => (
                <div
                  key={concert._id}
                  onClick={() => setSelectedConcert(concert)}
                  className={`p-4 rounded-lg cursor-pointer transition ${
                    selectedConcert?._id === concert._id
                      ? 'bg-accent bg-opacity-20 border border-accent'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary">{concert.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {concert.venue?.name} • {concert.venue?.city}, {concert.venue?.state}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(concert.datetime_local)}
                      </p>
                    </div>
                    {concert.performers?.[0]?.image && (
                      <img
                        src={concert.performers[0].image}
                        alt={concert.performers[0].name}
                        className="w-16 h-16 rounded-lg object-cover ml-4"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedConcert && (
          <div className="p-6 border-t border-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Selected:</p>
                <p className="font-semibold text-primary">{selectedConcert.title}</p>
              </div>
              <button
                onClick={handleAdd}
                disabled={adding}
                className="px-6 py-2 bg-accent text-secondary rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
              >
                {adding ? 'Adding...' : 'Add Concert'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddConcertModal