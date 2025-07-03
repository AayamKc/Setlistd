import React, { useState } from 'react'
import { postsAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const CreatePostModal = ({ isOpen, onClose, onPostCreated, attachedEvent = null }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const maxLength = 1000

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('Please write something to post')
      return
    }

    if (content.length > maxLength) {
      setError(`Post must be ${maxLength} characters or less`)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const postData = {
        content: content.trim(),
        eventId: attachedEvent?._id || null,
        media: [] // TODO: Add media upload functionality
      }

      const response = await postsAPI.createPost(postData)
      
      if (onPostCreated) {
        onPostCreated(response.data)
      }
      
      // Reset form and close modal
      setContent('')
      onClose()
    } catch (error) {
      console.error('Error creating post:', error)
      setError(error.response?.data?.error || 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary rounded-lg border border-primary max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-primary">
            Create Post
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={user?.user_metadata?.profilePicture || '/default-avatar.png'}
              alt={user?.user_metadata?.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-white">
                {user?.user_metadata?.username || user?.email}
              </p>
            </div>
          </div>

          {/* Text Area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            rows="6"
            maxLength={maxLength}
            disabled={isSubmitting}
          />
          
          {/* Character Count */}
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className={`${content.length > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
              {content.length} / {maxLength}
            </span>
          </div>

          {/* Attached Event */}
          {attachedEvent && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-primary/30">
              <p className="text-sm text-gray-600 mb-1">Posting about:</p>
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <div>
                  <p className="font-semibold text-white text-sm">
                    {attachedEvent.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    {attachedEvent.venue?.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex space-x-2">
              {/* TODO: Add media upload button */}
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-primary-dark transition-colors"
                title="Add photo (coming soon)"
                disabled
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="px-6 py-2 bg-primary text-secondary rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePostModal