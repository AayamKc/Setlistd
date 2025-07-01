const express = require('express');
const router = express.Router();
const { getArtistRating } = require('../controllers/reviewController');

// Get artist rating aggregated across all their events
router.get('/:artistName/rating', getArtistRating);

module.exports = router;