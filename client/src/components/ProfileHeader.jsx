import { useState, useRef } from 'react'
import api from '../utils/api'
import EditProfileModal from './EditProfileModal'
import CatalogModal from './CatalogModal'
import Toast from './Toast'

function ProfileHeader({ profile, isOwnProfile, isFollowing, onFollowToggle, onProfileUpdate }) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCatalogModal, setShowCatalogModal] = useState(false)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [addingConcert, setAddingConcert] = useState(false)
  const [toast, setToast] = useState(null)
  const profileInputRef = useRef(null)
  const bannerInputRef = useRef(null)

  const handleConcertSelect = async (concert, type) => {
    console.log('handleConcertSelect called with:', { concert, type })
    setAddingConcert(true)
    try {
      let concertId = concert._id
      let concertToAdd = concert
      
      // If no MongoDB _id, save the event first
      if (!concertId) {
        console.log('No MongoDB _id found, saving event first')
        console.log('Event data to save:', concert.fullEvent || concert)
        
        // Save the event to database
        const saveResponse = await api.post('/api/events/save', concert.fullEvent || concert)
        concertId = saveResponse.data._id
        concertToAdd = saveResponse.data
        console.log('Event saved with _id:', concertId)
      }
      
      if (!concertId) {
        throw new Error('Failed to save concert')
      }
      
      const endpoint = `/api/users/concerts/${type}/${concertId}`
      await api.post(endpoint)
      
      // Update the profile with the new concert
      const updatedProfile = { ...profile }
      
      if (type === 'attended') {
        updatedProfile.attendedConcerts = [...(profile.attendedConcerts || []), concertToAdd]
      } else if (type === 'wishlist') {
        updatedProfile.wishlistConcerts = [...(profile.wishlistConcerts || []), concertToAdd]
      } else if (type === 'favorites') {
        updatedProfile.favoriteConcerts = [...(profile.favoriteConcerts || []), concertToAdd]
      }
      
      onProfileUpdate(updatedProfile)
      setShowCatalogModal(false)
      
      // Refresh the page immediately to show updated lists
      window.location.reload()
    } catch (error) {
      console.error('Error adding concert:', error)
      console.error('Concert data:', concert)
      
      let errorMessage = 'Failed to add concert. Please try again.'
      
      if (error.message === 'Failed to save concert') {
        errorMessage = 'Failed to save concert to database. Please try again.'
      } else if (error.response?.status === 404) {
        errorMessage = 'Concert not found. Please try again.'
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || error.response.data.error || 'Concert may already be in your list.'
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setToast({ message: errorMessage, type: 'error' })
      setAddingConcert(false)
    }
  }

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingProfile(true)
    const formData = new FormData()
    formData.append('profilePicture', file)

    try {
      const response = await api.post('/api/users/upload-profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      onProfileUpdate({
        ...profile,
        profilePicture: response.data.profilePicture
      })
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      setToast({ message: 'Failed to upload profile picture', type: 'error' })
    } finally {
      setUploadingProfile(false)
    }
  }

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingBanner(true)
    const formData = new FormData()
    formData.append('bannerImage', file)

    try {
      const response = await api.post('/api/users/upload-banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      onProfileUpdate({
        ...profile,
        bannerImage: response.data.bannerImage
      })
    } catch (error) {
      console.error('Error uploading banner:', error)
      setToast({ message: 'Failed to upload banner', type: 'error' })
    } finally {
      setUploadingBanner(false)
    }
  }

  const stats = [
    { label: 'Concerts', value: profile.attendedConcerts?.length || 0 },
    { label: 'Following', value: profile.following?.length || 0 },
    { label: 'Followers', value: profile.followers?.length || 0 }
  ]

  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="relative h-64 md:h-80 overflow-hidden bg-gradient-to-br from-primary/20 to-primary-dark/20">
        {/* Blurred backdrop layer */}
        <div className="absolute inset-0">
          <img
            src={profile.bannerImage || '/Setlistd.png'}
            alt=""
            className="w-full h-full object-cover blur-xl opacity-50"
            loading="eager"
            decoding="async"
          />
        </div>
        
        {/* Main image layer */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={profile.bannerImage || '/Setlistd.png'}
            alt="Banner"
            className="h-full w-auto max-w-none object-contain"
            loading="eager"
            decoding="async"
          />
        </div>
        
        {isOwnProfile && (
          <button
            onClick={() => bannerInputRef.current?.click()}
            className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-primary p-2 rounded-full hover:bg-opacity-70 transition"
            disabled={uploadingBanner}
            title="Change Banner"
          >
            {uploadingBanner ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        )}
        
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          onChange={handleBannerUpload}
          className="hidden"
        />
      </div>

      {/* Profile Section Container */}
      <div className="relative">
        {/* Profile Picture - positioned to overlap banner */}
        <div className="absolute left-1/2 transform -translate-x-1/2 md:left-0 md:transform-none md:ml-16 -top-16 md:-top-20">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-800 border-4 border-secondary overflow-hidden">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl text-gray-600">
                {profile.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          
          {isOwnProfile && (
            <button
              onClick={() => profileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-accent text-secondary rounded-full p-2 hover:bg-opacity-90"
              disabled={uploadingProfile}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
          
          <input
            ref={profileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePictureUpload}
            className="hidden"
          />
        </div>

        {/* Profile Info */}
        <div className="max-w-6xl mx-auto px-4 pt-8 md:pt-4">
          {/* User Info */}
          <div className="text-center md:text-left md:ml-24">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between w-full gap-8">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-primary">
                  {profile.username}
                </h1>
                {profile.bio && (
                  <p className="mt-2 text-gray-400 max-w-2xl">{profile.bio}</p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                  {profile.location && (
                    <p className="text-gray-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location}
                    </p>
                  )}
                  
                  {/* Social Links */}
                  {(profile.socialLinks?.instagram || profile.socialLinks?.twitter || profile.socialLinks?.spotify) && (
                    <div className="flex gap-3">
                      {profile.socialLinks.instagram && (
                        <a
                          href={`https://instagram.com/${profile.socialLinks.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-primary transition"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                          </svg>
                        </a>
                      )}
                      {profile.socialLinks.twitter && (
                        <a
                          href={`https://twitter.com/${profile.socialLinks.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-primary transition"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                        </a>
                      )}
                      {profile.socialLinks.spotify && (
                        <a
                          href={`https://open.spotify.com/user/${profile.socialLinks.spotify}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-primary transition"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats and Action Buttons */}
              <div className="flex flex-col items-center md:items-end gap-4">
                {/* Stats */}
                <div className="flex gap-6">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-2xl font-bold text-primary">{stat.value}</div>
                      <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <>
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="px-6 py-2 bg-gray-800 bg-opacity-70 text-primary rounded-lg hover:bg-opacity-90 transition"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={() => setShowCatalogModal(true)}
                        className="px-6 py-2 bg-gray-800 bg-opacity-70 text-primary rounded-lg hover:bg-opacity-90 transition"
                      >
                        Catalog
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={onFollowToggle}
                        className={`px-6 py-2 rounded-lg transition ${
                          isFollowing
                            ? 'bg-gray-700 text-primary hover:bg-gray-600'
                            : 'bg-accent text-secondary hover:bg-opacity-90'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onUpdate={onProfileUpdate}
        />
      )}
      
      {showCatalogModal && (
        <CatalogModal
          onClose={() => setShowCatalogModal(false)}
          onConcertSelect={handleConcertSelect}
        />
      )}
      
      {/* Loading overlay */}
      {addingConcert && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-gray-800 text-white px-8 py-6 rounded-lg shadow-2xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-lg font-semibold">Adding...</div>
          </div>
        </div>
      )}
      
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default ProfileHeader;