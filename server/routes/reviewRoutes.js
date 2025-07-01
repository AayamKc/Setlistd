
const express = require('express');
const router = express.Router();
const { createReview, getEventReviews, getArtistRating, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:eventId/reviews').post(protect, createReview).get(getEventReviews);
router.route('/:eventId/reviews/:reviewId')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
