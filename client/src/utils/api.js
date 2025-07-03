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
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
    params: {
      _t: Date.now() // Cache buster
    }
  }),
}

export default api