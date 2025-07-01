import { useState, useEffect } from 'react'
import api from '../utils/api'
import ConcertCard from './ConcertCard'
import UserPosts from './UserPosts'
import AddConcertModal from './AddConcertModal'

function ProfileContent({ profile, activeTab, isOwnProfile }) {
  const [concerts, setConcerts] = useState({
    attended: [],
    wishlist: [],
    favorites: []
  })
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalType, setAddModalType] = useState('attended')

  useEffect(() => {
    if (activeTab !== 'posts') {
      fetchConcerts(activeTab)
    }
  }, [activeTab, profile._id])

  const fetchConcerts = async (type) => {
    try {
      setLoading(true)
      const response = await api.get(`/api/users/${profile._id}/concerts/${type}`)
      setConcerts(prev => ({
        ...prev,
        [type]: response.data
      }))
    } catch (error) {
      console.error(`Error fetching ${type} concerts:`, error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddConcert = (type) => {
    setAddModalType(type)
    setShowAddModal(true)
  }

  const handleConcertAdded = (concert, type) => {
    setConcerts(prev => ({
      ...prev,
      [type]: [...prev[type], concert]
    }))
  }

  const handleRemoveConcert = async (concertId, type) => {
    try {
      await api.delete(`/api/users/concerts/${type}/${concertId}`)
      setConcerts(prev => ({
        ...prev,
        [type]: prev[type].filter(c => c._id !== concertId)
      }))
    } catch (error) {
      console.error('Error removing concert:', error)
    }
  }

  if (activeTab === 'posts') {
    return <UserPosts userId={profile._id} isOwnProfile={isOwnProfile} />
  }

  const currentConcerts = concerts[activeTab]

  return (
    <div className="py-8">
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading concerts...</div>
        </div>
      ) : currentConcerts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {activeTab === 'attended' && "No concerts attended yet"}
            {activeTab === 'wishlist' && "No upcoming concerts in wishlist"}
            {activeTab === 'favorites' && "No favorite concerts yet"}
          </div>
          {isOwnProfile && (
            <button
              onClick={() => handleAddConcert(activeTab)}
              className="px-6 py-2 bg-accent text-secondary rounded-lg hover:bg-opacity-90"
            >
              Add Concert
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentConcerts.map((concert) => (
              <div key={concert._id} className="relative">
                <ConcertCard event={concert} />
                {isOwnProfile && (
                  <button
                    onClick={() => handleRemoveConcert(concert._id, activeTab)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
                    title="Remove from list"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          {isOwnProfile && (
            <div className="fixed bottom-6 right-6">
              <button
                onClick={() => handleAddConcert(activeTab)}
                className="bg-accent text-secondary rounded-full p-4 shadow-lg hover:bg-opacity-90 transition"
                title="Add concert"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}

      {showAddModal && (
        <AddConcertModal
          type={addModalType}
          onClose={() => setShowAddModal(false)}
          onAdd={handleConcertAdded}
        />
      )}
    </div>
  )
}

export default ProfileContent