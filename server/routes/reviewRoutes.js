
const express = require('express');
const router = express.Router();
const { createReview, getEventReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:eventId/reviews').post(protect, createReview).get(getEventReviews);

module.exports = router;
