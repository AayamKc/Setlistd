import React from 'react'
import { useNavigate } from 'react-router-dom'

const UserSearchResults = ({ users, onUserClick, className = '' }) => {
  const navigate = useNavigate()

  const handleUserClick = (username) => {
    if (onUserClick) {
      onUserClick(username)
    } else {
      navigate(`/user/${username}`)
    }
  }

  if (!users || users.length === 0) {
    return null
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {users.map((user) => (
        <div
          key={user._id}
          onClick={() => handleUserClick(user.username)}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-4">
            <img
              src={user.profilePicture || '/default-avatar.png'}
              alt={user.username}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {user.username}
              </h3>
              {user.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {user.bio}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                {user.location && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {user.location}
                  </span>
                )}
                {user.followersCount !== undefined && (
                  <span>{user.followersCount} followers</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default UserSearchResults