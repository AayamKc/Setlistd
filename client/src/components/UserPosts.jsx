import { useState, useEffect } from 'react'

function UserPosts({ userId, isOwnProfile }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch posts when API is ready
    setLoading(false)
  }, [userId])

  return (
    <div className="py-8">
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          Posts feature coming soon!
        </div>
        {isOwnProfile && (
          <button
            className="px-6 py-2 bg-accent text-secondary rounded-lg hover:bg-opacity-90"
            disabled
          >
            Create Post
          </button>
        )}
      </div>
    </div>
  )
}

export default UserPosts