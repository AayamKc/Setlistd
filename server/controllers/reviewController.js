
const Event = require('../models/Event');
const Review = require('../models/Review');

// @desc    Create new review
// @route   POST /api/events/:eventId/reviews
// @access  Private
exports.createReview = async (req, res) => {
  const { rating, reviewText } = req.body;
  const { eventId } = req.params; // This is now a SeatGeek event ID (number)
  
  console.log('Review submission attempt:');
  console.log('- Body:', req.body);
  console.log('- EventId:', eventId);
  console.log('- User object:', req.user);
  
  const userId = req.user.id; // Supabase user ID
  console.log('- Extracted userId:', userId);

  try {
    // Convert eventId to number since it comes as string from URL params
    const seatgeekEventId = parseInt(eventId);
    
    // Find event by SeatGeek ID, not MongoDB _id
    let event = await Event.findOne({ seatgeekId: seatgeekEventId });

    if (!event) {
      return res.status(404).json({ message: 'Event not found. Please ensure the event is saved to our database first.' });
    }

    // Check if user has already reviewed this event (using SeatGeek ID)
    const alreadyReviewed = await Review.findOne({ eventId: seatgeekEventId, userId });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this event' });
    }

    const review = new Review({
      eventId: seatgeekEventId,
      userId,
      rating,
      reviewText,
    });

    await review.save();

    // Update event average rating and review count (using SeatGeek ID)
    const reviews = await Review.find({ eventId: seatgeekEventId });
    const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);
    event.averageRating = totalRating / reviews.length;
    event.reviewCount = reviews.length;

    await event.save();

    res.status(201).json(review);
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all reviews for an event
// @route   GET /api/events/:eventId/reviews
// @access  Public
exports.getEventReviews = async (req, res) => {
  try {
    const seatgeekEventId = parseInt(req.params.eventId);
    const reviews = await Review.find({ eventId: seatgeekEventId }); // No populate since userId is just a string
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
