import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Header from './Header'
import ProfileHeader from './ProfileHeader'
import ProfileTabs from './ProfileTabs'
import ProfileContent from './ProfileContent'

function UserProfile() {
  const { username } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('attended')
  const [isFollowing, setIsFollowing] = useState(false)

  const isOwnProfile = user?.user_metadata?.username === username

  useEffect(() => {
    console.log('UserProfile Debug:', {
      username: username,
      userMetadata: user?.user_metadata,
      userUsername: user?.user_metadata?.username,
      isOwnProfile: isOwnProfile,
      user: user
    })
    fetchUserProfile()
  }, [username])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/users/${username}`)
      setProfile(response.data)
      
      // Check if current user is following this profile
      if (user && !isOwnProfile) {
        setIsFollowing(response.data.followers.some(f => f._id === user.id))
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      if (error.response?.status === 404) {
        setError('User not found')
      } else {
        setError('Failed to load profile')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFollowToggle = async () => {
    if (!user) {
      // Redirect to login or show login modal
      return
    }

    try {
      if (isFollowing) {
        await api.delete(`/api/users/follow/${profile._id}`)
        setIsFollowing(false)
        setProfile(prev => ({
          ...prev,
          followers: prev.followers.filter(f => f._id !== user.id)
        }))
      } else {
        await api.post(`/api/users/follow/${profile._id}`)
        setIsFollowing(true)
        setProfile(prev => ({
          ...prev,
          followers: [...prev.followers, { _id: user.id }]
        }))
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-primary text-xl">Loading profile...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">{error}</h2>
          {error === 'User not found' && user && (
            <>
              <p className="text-gray-400 mb-4">
                {isOwnProfile ? "Your profile hasn't been created yet." : "This user's profile doesn't exist yet."}
              </p>
              {isOwnProfile && (
                <button
                  onClick={async () => {
                try {
                  const response = await api.post('/api/users/init')
                  console.log('User initialized:', response.data)
                  window.location.reload()
                } catch (err) {
                  console.error('Failed to initialize user:', err)
                  alert(`Failed to initialize user: ${err.response?.data?.message || err.message}`)
                }
              }}
                  className="px-6 py-2 bg-primary text-secondary rounded-lg hover:bg-primary-dark mb-4 block mx-auto"
                >
                  Initialize Profile
                </button>
              )}
            </>
          )}
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary text-secondary rounded-lg hover:bg-primary-dark"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Header onLogoClick={() => navigate('/')} />
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onFollowToggle={handleFollowToggle}
        onProfileUpdate={setProfile}
      />
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <ProfileContent
          profile={profile}
          activeTab={activeTab}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </div>
  )
}

export default UserProfile