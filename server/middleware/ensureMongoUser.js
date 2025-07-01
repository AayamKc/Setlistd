const User = require('../models/User');

const ensureMongoUser = async (req, res, next) => {
  try {
    // Skip if no authenticated user
    if (!req.user) {
      console.log('ensureMongoUser: No authenticated user');
      return next();
    }

    const userId = req.user.id;
    const email = req.user.email;
    const username = req.user.user_metadata?.username || email.split('@')[0];
    
    console.log('ensureMongoUser: Processing user', { userId, email, username });

    // Check if user exists in MongoDB
    let mongoUser = await User.findById(userId);

    if (!mongoUser) {
      // Create user in MongoDB
      mongoUser = new User({
        _id: userId,
        email: email,
        username: username,
      });

      try {
        await mongoUser.save();
        console.log('Created MongoDB user for:', email);
      } catch (saveError) {
        // If username is taken, try with a number suffix
        if (saveError.code === 11000 && saveError.keyPattern?.username) {
          let suffix = 1;
          let newUsername = `${username}${suffix}`;
          
          while (suffix < 100) {
            try {
              mongoUser.username = newUsername;
              await mongoUser.save();
              console.log('Created MongoDB user with username:', newUsername);
              break;
            } catch (retryError) {
              if (retryError.code === 11000) {
                suffix++;
                newUsername = `${username}${suffix}`;
              } else {
                throw retryError;
              }
            }
          }
        } else {
          throw saveError;
        }
      }
    }

    // Attach MongoDB user to request
    req.mongoUser = mongoUser;
    next();
  } catch (error) {
    console.error('Error ensuring MongoDB user:', error);
    res.status(500).json({ message: 'Error creating user profile' });
  }
};

module.exports = ensureMongoUser;