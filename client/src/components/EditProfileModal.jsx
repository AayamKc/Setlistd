import { useState } from 'react'
import api from '../utils/api'

function EditProfileModal({ profile, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    bio: profile.bio || '',
    location: profile.location || '',
    socialLinks: {
      instagram: profile.socialLinks?.instagram || '',
      twitter: profile.socialLinks?.twitter || '',
      spotify: profile.socialLinks?.spotify || ''
    },
    isPrivate: profile.isPrivate || false
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await api.put('/api/users/profile', formData)
      onUpdate(response.data)
      onClose()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('social.')) {
      const socialField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">Edit Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-primary transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                maxLength={500}
                rows={4}
                className="w-full px-4 py-2 bg-gray-800 text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                placeholder="Tell us about yourself..."
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.bio.length}/500
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="City, State"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400">Social Links</h3>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Instagram Username
                </label>
                <input
                  type="text"
                  name="social.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="username"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Twitter Username
                </label>
                <input
                  type="text"
                  name="social.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="username"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Spotify Username
                </label>
                <input
                  type="text"
                  name="social.spotify"
                  value={formData.socialLinks.spotify}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="username"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleChange}
                  className="mr-2 w-4 h-4 text-accent bg-gray-800 rounded focus:ring-accent"
                />
                <span className="text-sm text-gray-400">Private Profile</span>
              </label>
              <span className="text-xs text-gray-500">Only followers can see your activity</span>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-800 text-primary rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-accent text-secondary rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProfileModal