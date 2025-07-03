import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postsAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Toast from './Toast'

const PostCard = ({ post, onDelete }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?.id))
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState(post.comments || [])
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [toast, setToast] = useState(null)

  const isOwner = user && (user.id === post.userId?._id || user.id === post.userId)

  const handleLike = async () => {
    if (!user) {
      setToast({ message: 'Please login to like posts', type: 'info' })
      return
    }

    try {
      const response = await postsAPI.toggleLike(post._id)
      setIsLiked(response.data.liked)
      setLikesCount(response.data.likesCount)
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleDelete = async () => {
    if (!isOwner) return
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.deletePost(post._id)
        if (onDelete) onDelete(post._id)
      } catch (error) {
        console.error('Error deleting post:', error)
        setToast({ message: 'Failed to delete post', type: 'error' })
      }
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!user) {
      setToast({ message: 'Please login to comment', type: 'info' })
      return
    }

    if (!commentText.trim()) return

    setIsSubmittingComment(true)
    try {
      const response = await postsAPI.addComment(post._id, { text: commentText })
      setComments([...comments, response.data])
      setCommentText('')
    } catch (error) {
      console.error('Error adding comment:', error)
      setToast({ message: 'Failed to add comment', type: 'error' })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await postsAPI.deleteComment(post._id, commentId)
      setComments(comments.filter(c => c._id !== commentId))
    } catch (error) {
      console.error('Error deleting comment:', error)
      setToast({ message: 'Failed to delete comment', type: 'error' })
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="relative">
      {toast && (
        <div className="fixed top-4 right-4 z-[100]">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
      <div className="bg-secondary rounded-lg border border-primary shadow-md p-6 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.userId?.profilePicture || '/default-avatar.png'}
            alt={post.userId?.username}
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
            onClick={() => navigate(`/user/${post.userId?.username}`)}
          />
          <div>
            <h3 
              className="font-semibold text-primary cursor-pointer hover:text-primary-dark hover:underline"
              onClick={() => navigate(`/user/${post.userId?.username}`)}
            >
              {post.userId?.username}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>
        
        {isOwner && (
          <button
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-500 transition-colors"
            title="Delete post"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-white whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Event Attachment */}
      {post.eventId && (
        <div 
          className="bg-gray-800 rounded-lg p-4 mb-4 cursor-pointer hover:bg-gray-700 transition-colors border border-primary/30"
          onClick={() => navigate(`/event/${post.eventId.seatgeekId}`)}
        >
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <div>
              <h4 className="font-semibold text-white">
                {post.eventId.title}
              </h4>
              <p className="text-sm text-gray-600">
                {post.eventId.venue?.name} • {new Date(post.eventId.datetime_local).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {post.media.map((item, index) => (
            <div key={index} className="relative aspect-square">
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt=""
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <video
                  src={item.url}
                  controls
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <svg 
              className="w-5 h-5" 
              fill={isLiked ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm">{likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm">{comments.length}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          {/* Comment Form */}
          {user && (
            <form onSubmit={handleAddComment} className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSubmittingComment}
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Post
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment._id} className="flex space-x-3">
                <img
                  src={comment.userId?.profilePicture || '/default-avatar.png'}
                  alt={comment.userId?.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="bg-gray-800 rounded-lg px-3 py-2">
                    <p className="font-semibold text-sm text-primary">
                      {comment.userId?.username}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {comment.text}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                    {(user?.id === comment.userId?._id || isOwner) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-xs text-gray-500 hover:text-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default PostCard