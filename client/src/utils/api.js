import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (email, password) => api.post('/auth/signup', { email, password }),
  logout: () => api.post('/auth/logout'),
}

export const eventsAPI = {
  getSavedEvents: (params) => api.get('/api/saved-events', { params }),
  getEventById: (id) => api.get(`/api/saved-events/${id}`),
  searchEvents: (params) => api.get('/api/events', { params }),
  getEventReviews: (eventId) => api.get(`/api/events/${eventId}/reviews`),
  submitReview: (eventId, data) => api.post(`/api/events/${eventId}/reviews`, data),
  updateReview: (eventId, reviewId, data) => api.put(`/api/events/${eventId}/reviews/${reviewId}`, data),
  deleteReview: (eventId, reviewId) => api.delete(`/api/events/${eventId}/reviews/${reviewId}`),
  getArtistRating: (artistName) => api.get(`/api/artists/${encodeURIComponent(artistName)}/rating`, {
    params: {
      _t: Date.now() // Cache buster
    }
  }),
}

export const usersAPI = {
  searchUsers: (query) => api.get('/api/users/search', { params: { q: query } }),
  getUserProfile: (username) => api.get(`/api/users/${username}`),
  followUser: (userId) => api.put(`/api/users/${userId}/follow`),
  unfollowUser: (userId) => api.put(`/api/users/${userId}/unfollow`),
}

export const postsAPI = {
  createPost: (data) => api.post('/api/posts', data),
  getFeed: (params) => api.get('/api/posts/feed', { params }),
  getUserPosts: (userId, params) => api.get(`/api/posts/user/${userId}`, { params }),
  getPost: (postId) => api.get(`/api/posts/${postId}`),
  updatePost: (postId, data) => api.put(`/api/posts/${postId}`, data),
  deletePost: (postId) => api.delete(`/api/posts/${postId}`),
  toggleLike: (postId) => api.post(`/api/posts/${postId}/like`),
  addComment: (postId, data) => api.post(`/api/posts/${postId}/comments`, data),
  deleteComment: (postId, commentId) => api.delete(`/api/posts/${postId}/comments/${commentId}`),
}

export default api