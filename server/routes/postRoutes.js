const express = require('express')
const router = express.Router()
const postController = require('../controllers/postController')
const { protect } = require('../middleware/authMiddleware')
const ensureMongoUser = require('../middleware/ensureMongoUser')

// All routes require authentication
router.use(protect)
router.use(ensureMongoUser)

// Post CRUD operations
router.post('/', postController.createPost)
router.get('/feed', postController.getFeed)
router.get('/:postId', postController.getPost)
router.put('/:postId', postController.updatePost)
router.delete('/:postId', postController.deletePost)

// User posts
router.get('/user/:userId', postController.getUserPosts)

// Like/Unlike
router.post('/:postId/like', postController.toggleLike)

// Comments
router.post('/:postId/comments', postController.addComment)
router.delete('/:postId/comments/:commentId', postController.deleteComment)

module.exports = router