
const Event = require('../models/Event');
const Review = require('../models/Review');

// @desc    Create new review
// @route   POST /api/events/:eventId/reviews
// @access  Private
exports.createReview = async (req, res) => {
  const { rating, reviewText } = req.body;
  const { eventId } = req.params; // This is now a SeatGeek event ID (number)
  
  const userId = req.user.id; // Supabase user ID
  const username = req.user.user_metadata?.username || 'Anonymous'; // Extract username from user metadata

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
      username,
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

// @desc    Get artist rating aggregated across all their events
// @route   GET /api/artists/:artistName/rating
// @access  Public
exports.getArtistRating = async (req, res) => {
  try {
    const { artistName } = req.params;
    
    // Find all events where this artist is a performer
    const events = await Event.find({ 
      'performers.name': { $regex: new RegExp(artistName, 'i') } 
    });
    
    if (events.length === 0) {
      return res.json({ 
        artistName,
        averageRating: 0,
        totalReviews: 0,
        hasReviews: false
      });
    }
    
    // Get all event IDs for this artist
    const eventIds = events.map(event => event.seatgeekId);
    
    // Get all reviews for these events
    const reviews = await Review.find({ eventId: { $in: eventIds } });
    
    if (reviews.length === 0) {
      return res.json({ 
        artistName,
        averageRating: 0,
        totalReviews: 0,
        hasReviews: false
      });
    }
    
    // Calculate average rating
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    res.json({
      artistName,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews: reviews.length,
      hasReviews: true
    });
  } catch (error) {
    console.error('Get artist rating error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
