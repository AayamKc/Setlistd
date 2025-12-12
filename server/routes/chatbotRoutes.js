const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

// All chatbot routes can be protected if needed,
// but for now we can leave it open for simplicity.
// For a production app, you'd want to ensure users are logged in.
// router.use(protect);

// POST /api/chatbot/
router.post('/', handleChat);

module.exports = router;
