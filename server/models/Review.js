
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  eventId: {
    type: Number, // SeatGeek event ID
    required: true,
  },
  userId: {
    type: String, // Supabase user ID (UUID string)
    required: true,
  },
  username: {
    type: String, // Username from Supabase user metadata
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  reviewText: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Review', reviewSchema);
