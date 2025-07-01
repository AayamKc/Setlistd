const express = require('express');
const router = express.Router();
const { protect: authMiddleware } = require('../middleware/authMiddleware');
const ensureMongoUser = require('../middleware/ensureMongoUser');
const { uploadProfile } = require('../middleware/uploadMiddleware');
const {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  uploadBannerImage,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  searchUsers,
  addAttendedConcert,
  removeAttendedConcert,
  addWishlistConcert,
  removeWishlistConcert,
  addFavoriteConcert,
  removeFavoriteConcert,
  getUserAttendedConcerts,
  getUserWishlist,
  getUserFavorites,
} = require('../controllers/userController');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'User routes are working!' });
});

// Initialize user (for testing) - must be before dynamic routes
router.post('/init', authMiddleware, ensureMongoUser, (req, res) => {
  console.log('Init endpoint hit, mongoUser:', req.mongoUser);
  res.json({ message: 'User initialized', user: req.mongoUser });
});

// Public routes
router.get('/search', searchUsers);
router.get('/:username', getUserProfile);
router.get('/:userId/followers', getUserFollowers);
router.get('/:userId/following', getUserFollowing);
router.get('/:userId/concerts/attended', getUserAttendedConcerts);
router.get('/:userId/concerts/wishlist', getUserWishlist);
router.get('/:userId/concerts/favorites', getUserFavorites);

// Protected routes
router.put('/profile', authMiddleware, ensureMongoUser, updateUserProfile);
router.post('/upload-profile-picture', authMiddleware, ensureMongoUser, uploadProfile.single('profilePicture'), uploadProfilePicture);
router.post('/upload-banner', authMiddleware, ensureMongoUser, uploadProfile.single('bannerImage'), uploadBannerImage);
router.post('/follow/:targetUserId', authMiddleware, ensureMongoUser, followUser);
router.delete('/follow/:targetUserId', authMiddleware, ensureMongoUser, unfollowUser);

// Concert management routes
router.post('/concerts/attended/:eventId', authMiddleware, ensureMongoUser, addAttendedConcert);
router.delete('/concerts/attended/:eventId', authMiddleware, ensureMongoUser, removeAttendedConcert);
router.post('/concerts/wishlist/:eventId', authMiddleware, ensureMongoUser, addWishlistConcert);
router.delete('/concerts/wishlist/:eventId', authMiddleware, ensureMongoUser, removeWishlistConcert);
router.post('/concerts/favorites/:eventId', authMiddleware, ensureMongoUser, addFavoriteConcert);
router.delete('/concerts/favorites/:eventId', authMiddleware, ensureMongoUser, removeFavoriteConcert);

module.exports = router;