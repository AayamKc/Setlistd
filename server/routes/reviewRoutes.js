
const express = require('express');
const router = express.Router();
const { createReview, getEventReviews, getArtistRating, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const ensureMongoUser = require('../middleware/ensureMongoUser');

router.route('/:eventId/reviews').post(protect, ensureMongoUser, createReview).get(getEventReviews);
router.route('/:eventId/reviews/:reviewId')
  .put(protect, ensureMongoUser, updateReview)
  .delete(protect, ensureMongoUser, deleteReview);

module.exports = router;
