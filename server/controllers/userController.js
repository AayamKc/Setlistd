const User = require('../models/User');
const Event = require('../models/Event');
const { uploadToSupabase } = require('../middleware/uploadMiddleware');

// Get user profile by username
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    console.log('getUserProfile: Looking for username:', username);
    
    const user = await User.findOne({ username })
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture')
      .populate('attendedConcerts')
      .populate('wishlistConcerts')
      .populate('favoriteConcerts');
    
    console.log('getUserProfile: Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If profile is private and not the user's own profile or not following
    if (user.isPrivate && user._id !== req.user?.id && !user.followers.includes(req.user?.id)) {
      return res.json({
        _id: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
        bannerImage: user.bannerImage,
        bio: user.bio,
        isPrivate: true,
        followersCount: user.followers.length,
        followingCount: user.following.length,
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, location, socialLinks, isPrivate } = req.body;
    
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    console.log('Profile picture upload request received');
    console.log('User:', req.user?.id);
    console.log('File:', req.file ? 'Present' : 'Missing');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File details:', {
      fieldname: req.file.fieldname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const userId = req.user.id;
    const publicUrl = await uploadToSupabase(req.file, 'profile-images', userId);
    
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: publicUrl },
      { new: true }
    );
    
    res.json({ profilePicture: publicUrl });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    console.error('Full error details:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload banner image
const uploadBannerImage = async (req, res) => {
  try {
    console.log('Banner image upload request received');
    console.log('User:', req.user?.id);
    console.log('File:', req.file ? 'Present' : 'Missing');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File details:', {
      fieldname: req.file.fieldname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const userId = req.user.id;
    const publicUrl = await uploadToSupabase(req.file, 'banner-images', userId);
    
    const user = await User.findByIdAndUpdate(
      userId,
      { bannerImage: publicUrl },
      { new: true }
    );
    
    res.json({ bannerImage: publicUrl });
  } catch (error) {
    console.error('Error uploading banner image:', error);
    console.error('Full error details:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Follow a user
const followUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;
    
    if (userId === targetUserId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    
    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId),
    ]);
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.following.includes(targetUserId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }
    
    user.following.push(targetUserId);
    targetUser.followers.push(userId);
    
    await Promise.all([user.save(), targetUser.save()]);
    
    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;
    
    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId),
    ]);
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.following = user.following.filter(id => id !== targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id !== userId);
    
    await Promise.all([user.save(), targetUser.save()]);
    
    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's followers
const getUserFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .populate('followers', 'username profilePicture bio');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.followers);
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's following
const getUserFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .populate('following', 'username profilePicture bio');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.following);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }
    
    const users = await User.find({
      username: { $regex: q, $options: 'i' }
    })
    .select('username profilePicture bio')
    .limit(20);
    
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add concert to attended list
const addAttendedConcert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const user = await User.findById(userId);
    if (user.attendedConcerts.includes(eventId)) {
      return res.status(400).json({ message: 'Concert already in attended list' });
    }
    
    user.attendedConcerts.push(eventId);
    await user.save();
    
    res.json({ message: 'Concert added to attended list' });
  } catch (error) {
    console.error('Error adding attended concert:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove concert from attended list
const removeAttendedConcert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;
    
    const user = await User.findById(userId);
    user.attendedConcerts = user.attendedConcerts.filter(id => id.toString() !== eventId);
    await user.save();
    
    res.json({ message: 'Concert removed from attended list' });
  } catch (error) {
    console.error('Error removing attended concert:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add concert to wishlist
const addWishlistConcert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if concert is in the future
    if (new Date(event.datetime_local) < new Date()) {
      return res.status(400).json({ message: 'Cannot add past concerts to wishlist' });
    }
    
    const user = await User.findById(userId);
    if (user.wishlistConcerts.includes(eventId)) {
      return res.status(400).json({ message: 'Concert already in wishlist' });
    }
    
    user.wishlistConcerts.push(eventId);
    await user.save();
    
    res.json({ message: 'Concert added to wishlist' });
  } catch (error) {
    console.error('Error adding wishlist concert:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove concert from wishlist
const removeWishlistConcert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;
    
    const user = await User.findById(userId);
    user.wishlistConcerts = user.wishlistConcerts.filter(id => id.toString() !== eventId);
    await user.save();
    
    res.json({ message: 'Concert removed from wishlist' });
  } catch (error) {
    console.error('Error removing wishlist concert:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add concert to favorites
const addFavoriteConcert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const user = await User.findById(userId);
    if (user.favoriteConcerts.includes(eventId)) {
      return res.status(400).json({ message: 'Concert already in favorites' });
    }
    
    user.favoriteConcerts.push(eventId);
    await user.save();
    
    res.json({ message: 'Concert added to favorites' });
  } catch (error) {
    console.error('Error adding favorite concert:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove concert from favorites
const removeFavoriteConcert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;
    
    const user = await User.findById(userId);
    user.favoriteConcerts = user.favoriteConcerts.filter(id => id.toString() !== eventId);
    await user.save();
    
    res.json({ message: 'Concert removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite concert:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's attended concerts
const getUserAttendedConcerts = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .populate({
        path: 'attendedConcerts',
        options: { sort: { datetime_local: -1 } }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.attendedConcerts);
  } catch (error) {
    console.error('Error fetching attended concerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's wishlist
const getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .populate({
        path: 'wishlistConcerts',
        options: { sort: { datetime_local: 1 } }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Filter out past concerts
    const upcomingConcerts = user.wishlistConcerts.filter(
      concert => new Date(concert.datetime_local) > new Date()
    );
    
    res.json(upcomingConcerts);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's favorite concerts
const getUserFavorites = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .populate('favoriteConcerts');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.favoriteConcerts);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  uploadBannerImage,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  searchUsers,
  addAttendedConcert,
  removeAttendedConcert,
  addWishlistConcert,
  removeWishlistConcert,
  addFavoriteConcert,
  removeFavoriteConcert,
  getUserAttendedConcerts,
  getUserWishlist,
  getUserFavorites,
};