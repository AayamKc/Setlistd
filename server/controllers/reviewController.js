
const Event = require('../models/Event');
const Review = require('../models/Review');

// @desc    Create new review
// @route   POST /api/events/:eventId/reviews
// @access  Private
exports.createReview = async (req, res) => {
  const { rating, reviewText } = req.body;
  const { eventId } = req.params;
  const userId = req.user.id; // Assuming user ID is available from auth middleware

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user has already reviewed this event
    const alreadyReviewed = await Review.findOne({ eventId, userId });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this event' });
    }

    const review = new Review({
      eventId,
      userId,
      rating,
      reviewText,
    });

    await review.save();

    // Update event average rating and review count
    const reviews = await Review.find({ eventId });
    const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);
    event.averageRating = totalRating / reviews.length;
    event.reviewCount = reviews.length;

    await event.save();

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all reviews for an event
// @route   GET /api/events/:eventId/reviews
// @access  Public
exports.getEventReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ eventId: req.params.eventId }).populate('userId', 'name'); // Populate user name
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
