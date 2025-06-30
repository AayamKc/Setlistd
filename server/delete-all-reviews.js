// Script to delete all reviews from the database
require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('./models/Review');

async function deleteAllReviews() {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await Review.deleteMany({});
  console.log(`Deleted ${result.deletedCount} reviews.`);
  await mongoose.disconnect();
}

deleteAllReviews().catch(err => {
  console.error(err);
  process.exit(1);
});
