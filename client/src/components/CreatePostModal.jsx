import React, { useState, useEffect, useRef } from 'react'
import { postsAPI, usersAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import Toast from './Toast'
import { compressImage } from '../utils/imageCompression'

const CreatePostModal = ({ isOpen, onClose, onPostCreated, attachedEvent = null }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [userProfile, setUserProfile] = useState(null)
  const [selectedImages, setSelectedImages] = useState([])
  const [imageUrls, setImageUrls] = useState([])
  const [toast, setToast] = useState(null)
  const fileInputRef = useRef(null)

  const maxLength = 1000

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.user_metadata?.username && isOpen) {
        try {
          const response = await usersAPI.getUserProfile(user.user_metadata.username)
          setUserProfile(response.data)
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      }
    }
    
    fetchUserProfile()
  }, [user, isOpen])

  // Clean up preview URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [imageUrls])

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    const maxImages = 4
    const maxSizeInMB = 5
    
    // Check if adding these images would exceed the limit
    if (selectedImages.length + files.length > maxImages) {
      setToast({ 
        message: `You can only upload up to ${maxImages} images`, 
        type: 'error' 
      })
      return
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
      const isValidSize = file.size <= maxSizeInMB * 1024 * 1024
      
      if (!isValidType) {
        setToast({ 
          message: `${file.name} is not a valid image type`, 
          type: 'error' 
        })
        return false
      }
      
      if (!isValidSize) {
        setToast({ 
          message: `${file.name} exceeds ${maxSizeInMB}MB size limit`, 
          type: 'error' 
        })
        return false
      }
      
      return true
    })

    if (validFiles.length > 0) {
      const newImages = [...selectedImages, ...validFiles]
      setSelectedImages(newImages)
      
      // Create preview URLs
      const newUrls = validFiles.map(file => URL.createObjectURL(file))
      setImageUrls([...imageUrls, ...newUrls])
    }

    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newUrls = imageUrls.filter((_, i) => i !== index)
    
    // Clean up the removed preview URL
    URL.revokeObjectURL(imageUrls[index])
    
    setSelectedImages(newImages)
    setImageUrls(newUrls)
  }

  const uploadImages = async () => {
    const uploadedUrls = []
    
    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i]
      
      try {
        // Compress the image if it's larger than 1MB
        let fileToUpload = file
        if (file.size > 1024 * 1024) {
          setToast({ 
            message: `Compressing ${file.name}...`, 
            type: 'info' 
          })
          fileToUpload = await compressImage(file, 1200, 1200, 0.8)
        }
        
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 9)
        const extension = file.name.split('.').pop()
        const fileName = `${user.id}/${timestamp}-${random}.${extension}`

        const { data, error } = await supabase.storage
          .from('post-images')
          .upload(fileName, fileToUpload)

        if (error) throw error

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName)

        uploadedUrls.push({
          type: 'image',
          url: publicUrl
        })
      } catch (error) {
        console.error('Error uploading image:', error)
        throw new Error(`Failed to upload ${file.name}`)
      }
    }
    
    return uploadedUrls
  }

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
      // Upload images first if any
      let uploadedMedia = []
      if (selectedImages.length > 0) {
        try {
          uploadedMedia = await uploadImages()
        } catch (uploadError) {
          setError(uploadError.message)
          setIsSubmitting(false)
          return
        }
      }

      const postData = {
        content: content.trim(),
        eventId: attachedEvent?._id || null,
        media: uploadedMedia
      }

      const response = await postsAPI.createPost(postData)
      
      if (onPostCreated) {
        onPostCreated(response.data)
      }
      
      // Reset form and close modal
      setContent('')
      setSelectedImages([])
      setImageUrls([])
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
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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
            {userProfile?.profilePicture ? (
              <img
                src={userProfile.profilePicture}
                alt={userProfile.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400 text-lg">
                  {(user?.user_metadata?.username || user?.email)?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
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

          {/* Image Preview */}
          {imageUrls.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Selected images:</p>
              <div className="grid grid-cols-2 gap-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
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
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={isSubmitting || selectedImages.length >= 4}
              />
              
              {/* Media upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={selectedImages.length >= 4 ? "Maximum 4 images allowed" : "Add photo"}
                disabled={isSubmitting || selectedImages.length >= 4}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              
              {selectedImages.length > 0 && (
                <span className="text-sm text-gray-500 self-center">
                  {selectedImages.length}/4 images
                </span>
              )}
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
    </>
  )
}

export default CreatePostModal