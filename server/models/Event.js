const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // SeatGeek event ID for uniqueness
  seatgeekId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  datetime_local: {
    type: Date,
    required: true
  },
  datetime_utc: {
    type: Date
  },
  url: String,
  
  // Venue information
  venue: {
    id: Number,
    name: String,
    address: String,
    city: String,
    state: String,
    country: String,
    postal_code: String,
    location: {
      lat: Number,
      lon: Number
    }
  },
  
  // Performers/Artists
  performers: [{
    id: Number,
    name: String,
    short_name: String,
    url: String,
    image: String,
    genres: [{
      id: Number,
      name: String,
      slug: String,
      primary: Boolean
    }],
    primary: Boolean,
    type: String,
    score: Number,
    popularity: Number,
    image_attribution: String,
    image_license: String,
    image_rights_message: String,
    relative_url: String,
    slug: String,
    home_venue_id: Number,
    num_upcoming_events: Number,
    has_upcoming_events: Boolean,
    is_event: Boolean,
    location: mongoose.Schema.Types.Mixed,
    colors: mongoose.Schema.Types.Mixed,
    divisions: mongoose.Schema.Types.Mixed,
    links: mongoose.Schema.Types.Mixed,
    stats: mongoose.Schema.Types.Mixed,
    taxonomies: mongoose.Schema.Types.Mixed,
    images: mongoose.Schema.Types.Mixed
  }],
  
  // Event statistics
  stats: {
    lowest_price: Number,
    highest_price: Number,
    average_price: Number,
    median_price: Number,
    lowest_sg_base_price: Number,
    highest_sg_base_price: Number
  },
  
  // Categories and taxonomies
  taxonomies: [{
    id: Number,
    name: String,
    parent_id: Number,
    document_source: String,
    rank: Number
  }],
  
  type: String,
  status: String,
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
eventSchema.index({ datetime_local: 1 });
eventSchema.index({ 'venue.city': 1 });
eventSchema.index({ 'performers.name': 1 });

module.exports = mongoose.model('Event', eventSchema);
