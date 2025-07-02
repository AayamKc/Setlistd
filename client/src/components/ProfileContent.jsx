import { useState, useEffect } from 'react'
import api from '../utils/api'
import ConcertCard from './ConcertCard'
import UserPosts from './UserPosts'
import AddConcertModal from './AddConcertModal'
import ConfirmDialog from './ConfirmDialog'

function ProfileContent({ profile, activeTab, isOwnProfile }) {
  const [concerts, setConcerts] = useState({
    attended: [],
    wishlist: [],
    favorites: []
  })
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalType, setAddModalType] = useState('attended')
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, concertId: null, type: null })

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
    setConfirmDialog({ isOpen: true, concertId, type })
  }

  const confirmRemoveConcert = async () => {
    const { concertId, type } = confirmDialog
    try {
      await api.delete(`/api/users/concerts/${type}/${concertId}`)
      setConcerts(prev => ({
        ...prev,
        [type]: prev[type].filter(c => c._id !== concertId)
      }))
    } catch (error) {
      console.error('Error removing concert:', error)
    }
    setConfirmDialog({ isOpen: false, concertId: null, type: null })
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
                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-80 text-gray-400 rounded-lg p-2 hover:bg-opacity-100 hover:text-primary transition-all duration-200"
                    title="Remove from list"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Remove Concert"
        message={`Are you sure you want to remove this concert from your ${confirmDialog.type} list?`}
        onConfirm={confirmRemoveConcert}
        onCancel={() => setConfirmDialog({ isOpen: false, concertId: null, type: null })}
        confirmText="Remove"
        cancelText="Cancel"
      />
    </div>
  )
}

export default ProfileContent