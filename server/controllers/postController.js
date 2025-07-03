const Post = require('../models/Post')
const User = require('../models/User')
const Event = require('../models/Event')

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { content, eventId, media } = req.body
    const userId = req.mongoUser._id

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Post content is required' })
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: 'Post content must be 1000 characters or less' })
    }

    // Create the post
    const post = new Post({
      userId,
      content: content.trim(),
      eventId: eventId || null,
      media: media || []
    })

    await post.save()

    // Update user's posts array and count
    await User.findByIdAndUpdate(userId, {
      $push: { posts: post._id },
      $inc: { postsCount: 1 }
    })

    // Populate user and event info
    await post.populate('userId', 'username profilePicture')
    if (eventId) {
      await post.populate('eventId', 'seatgeekId title performers venue datetime_local')
    }

    res.status(201).json(post)
  } catch (error) {
    console.error('Error creating post:', error)
    res.status(500).json({ error: 'Failed to create post' })
  }
}

// Get posts feed (from users you follow)
exports.getFeed = async (req, res) => {
  try {
    const userId = req.mongoUser._id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    // Get the current user to find who they follow
    const currentUser = await User.findById(userId)
    
    // Include the user's own posts and posts from people they follow
    const userIds = [userId, ...currentUser.following]

    const posts = await Post.find({ userId: { $in: userIds } })
      .populate('userId', 'username profilePicture')
      .populate('eventId', 'seatgeekId title performers venue datetime_local')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json(posts)
  } catch (error) {
    console.error('Error fetching feed:', error)
    res.status(500).json({ error: 'Failed to fetch feed' })
  }
}

// Get posts by a specific user
exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const posts = await Post.find({ userId })
      .populate('userId', 'username profilePicture')
      .populate('eventId', 'seatgeekId title performers venue datetime_local')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json(posts)
  } catch (error) {
    console.error('Error fetching user posts:', error)
    res.status(500).json({ error: 'Failed to fetch user posts' })
  }
}

// Get a single post
exports.getPost = async (req, res) => {
  try {
    const { postId } = req.params

    const post = await Post.findById(postId)
      .populate('userId', 'username profilePicture')
      .populate('eventId', 'seatgeekId title performers venue datetime_local')
      .populate('comments.userId', 'username profilePicture')

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    res.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    res.status(500).json({ error: 'Failed to fetch post' })
  }
}

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params
    const { content } = req.body
    const userId = req.mongoUser._id

    const post = await Post.findById(postId)
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    // Check if the user owns the post
    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You can only edit your own posts' })
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Post content is required' })
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: 'Post content must be 1000 characters or less' })
    }

    post.content = content.trim()
    await post.save()

    await post.populate('userId', 'username profilePicture')
    if (post.eventId) {
      await post.populate('eventId', 'seatgeekId title performers venue datetime_local')
    }

    res.json(post)
  } catch (error) {
    console.error('Error updating post:', error)
    res.status(500).json({ error: 'Failed to update post' })
  }
}

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params
    const userId = req.mongoUser._id

    const post = await Post.findById(postId)
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    // Check if the user owns the post
    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You can only delete your own posts' })
    }

    await post.deleteOne()
    
    // Update user's posts array and count
    await User.findByIdAndUpdate(userId, {
      $pull: { posts: postId },
      $inc: { postsCount: -1 }
    })
    
    res.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    res.status(500).json({ error: 'Failed to delete post' })
  }
}

// Like/Unlike a post
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params
    const userId = req.mongoUser._id

    const post = await Post.findById(postId)
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    const likeIndex = post.likes.indexOf(userId)
    
    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1)
    } else {
      // Like
      post.likes.push(userId)
    }

    await post.save()
    
    res.json({ 
      liked: likeIndex === -1,
      likesCount: post.likes.length 
    })
  } catch (error) {
    console.error('Error toggling like:', error)
    res.status(500).json({ error: 'Failed to toggle like' })
  }
}

// Add a comment to a post
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params
    const { text } = req.body
    const userId = req.mongoUser._id

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' })
    }

    const post = await Post.findById(postId)
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    const comment = {
      userId,
      text: text.trim(),
      createdAt: new Date()
    }

    post.comments.push(comment)
    await post.save()

    // Get the populated comment
    await post.populate('comments.userId', 'username profilePicture')
    const newComment = post.comments[post.comments.length - 1]

    res.status(201).json(newComment)
  } catch (error) {
    console.error('Error adding comment:', error)
    res.status(500).json({ error: 'Failed to add comment' })
  }
}

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params
    const userId = req.mongoUser._id

    const post = await Post.findById(postId)
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    const comment = post.comments.id(commentId)
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    // Check if the user owns the comment or the post
    if (comment.userId.toString() !== userId.toString() && 
        post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You can only delete your own comments' })
    }

    comment.deleteOne()
    await post.save()

    res.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Error deleting comment:', error)
    res.status(500).json({ error: 'Failed to delete comment' })
  }
}