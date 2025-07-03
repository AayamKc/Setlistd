import { useState, useEffect } from 'react'
import { postsAPI } from '../utils/api'
import PostCard from './PostCard'
import CreatePostModal from './CreatePostModal'

function UserPosts({ userId, isOwnProfile }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [userId])

  const fetchPosts = async (loadMore = false) => {
    try {
      setLoading(!loadMore)
      const currentPage = loadMore ? page + 1 : 1
      const response = await postsAPI.getUserPosts(userId, { 
        page: currentPage, 
        limit: 20 
      })
      
      if (loadMore) {
        setPosts([...posts, ...response.data])
      } else {
        setPosts(response.data)
      }
      
      setHasMore(response.data.length === 20)
      if (loadMore) setPage(currentPage)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts])
  }

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post._id !== postId))
  }

  if (loading && posts.length === 0) {
    return (
      <div className="py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-secondary rounded-lg border border-primary shadow-md p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-32"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      {/* Create Post Button */}
      {isOwnProfile && (
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Post</span>
          </button>
        </div>
      )}

      {/* Posts List */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={handlePostDeleted}
            />
          ))}
          
          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => fetchPosts(true)}
                disabled={loading}
                className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {isOwnProfile ? "You haven't created any posts yet." : "No posts to show."}
          </div>
          {isOwnProfile && (
            <p className="text-sm text-gray-500">
              Share your concert experiences with your followers!
            </p>
          )}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  )
}

export default UserPosts