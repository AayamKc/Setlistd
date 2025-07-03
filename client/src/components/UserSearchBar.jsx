import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersAPI } from '../utils/api'

const UserSearchBar = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const searchTimeoutRef = useRef(null)
  const navigate = useNavigate()

  // Search function with manual debouncing
  const searchUsers = useCallback(async (searchQuery) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await usersAPI.searchUsers(searchQuery)
      setResults(response.data)
    } catch (error) {
      console.error('Error searching users:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchUsers(query)
    }, 300)

    // Cleanup on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query, searchUsers])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleUserClick = (username) => {
    navigate(`/user/${username}`)
    setQuery('')
    setResults([])
    setShowDropdown(false)
  }

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowDropdown(true)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={handleInputFocus}
          placeholder="Search users..."
          className="w-full px-4 py-2 pl-10 pr-4 text-sm bg-gray-800 text-white border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-400"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>

      {/* Dropdown Results */}
      {showDropdown && (query.length >= 2 || results.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <ul className="py-2">
              {results.map((user) => (
                <li key={user._id}>
                  <button
                    onClick={() => handleUserClick(user.username)}
                    className="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
                  >
                    <img
                      src={user.profilePicture || '/default-avatar.png'}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </p>
                      {user.bio && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No users found
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default UserSearchBar