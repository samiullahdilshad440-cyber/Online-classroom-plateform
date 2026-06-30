const express = require('express');
const {
  getConversation,
  sendMessage,
  getUnreadCount,
  getConversations
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/conversations')
  .get(protect, getConversations);

router.route('/unread-count')
  .get(protect, getUnreadCount);

router.route('/:withUserId')
  .get(protect, getConversation);

router.route('/')
  .post(protect, sendMessage);

module.exports = router;