import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usersAPI } from '../utils/api'
import Toast from './Toast'

const UserSearchResults = ({ users, onUserClick, className = '' }) => {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [followingStatus, setFollowingStatus] = useState({})
  const [toast, setToast] = useState(null)

  const handleUserClick = (e, username) => {
    // Prevent navigation if clicking on the follow button
    if (e.target.closest('button')) {
      return
    }
    
    if (onUserClick) {
      onUserClick(username)
    } else {
      navigate(`/user/${username}`)
    }
  }

  const handleFollowToggle = async (e, userId, isCurrentlyFollowing) => {
    e.stopPropagation()
    
    try {
      if (isCurrentlyFollowing) {
        await usersAPI.unfollowUser(userId)
        setFollowingStatus(prev => ({ ...prev, [userId]: false }))
        setToast({ message: 'Unfollowed successfully', type: 'success' })
      } else {
        await usersAPI.followUser(userId)
        setFollowingStatus(prev => ({ ...prev, [userId]: true }))
        setToast({ message: 'Following successfully', type: 'success' })
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      setToast({ 
        message: `Failed to ${isCurrentlyFollowing ? 'unfollow' : 'follow'} user`, 
        type: 'error' 
      })
    }
  }

  if (!users || users.length === 0) {
    return null
  }

  return (
    <>
      <div className={`grid gap-4 ${className}`}>
        {users.map((user) => {
          const isCurrentUser = currentUser?.id === user._id
          const isFollowing = followingStatus[user._id] ?? user.isFollowing ?? false
          
          return (
            <div
              key={user._id}
              onClick={(e) => handleUserClick(e, user.username)}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={user.profilePicture || '/default-avatar.png'}
                  alt={user.username}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-secondary">
                    {user.username}
                  </h3>
                  {user.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    {user.location && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {user.location}
                      </span>
                    )}
                    <span>{user.followers?.length || 0} followers</span>
                  </div>
                </div>
                
                {/* Follow Button */}
                {!isCurrentUser && currentUser && (
                  <button
                    onClick={(e) => handleFollowToggle(e, user._id, isFollowing)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-primary text-secondary hover:bg-primary-dark'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}

export default UserSearchResults