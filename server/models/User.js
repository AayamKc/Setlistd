const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: { // This will store the Supabase user ID
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  profilePicture: {
    type: String,
    default: null,
  },
  bannerImage: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    maxlength: 500,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  socialLinks: {
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    spotify: { type: String, default: '' },
  },
  followers: [{
    type: String,
    ref: 'User',
  }],
  following: [{
    type: String,
    ref: 'User',
  }],
  attendedConcerts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  }],
  wishlistConcerts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  }],
  favoriteConcerts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }],
  postsCount: {
    type: Number,
    default: 0,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);