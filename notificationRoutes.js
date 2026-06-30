const express = require('express');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getMyNotifications);

router.route('/read-all')
  .patch(protect, markAllAsRead);

router.route('/:id/read')
  .patch(protect, markAsRead);

module.exports = router;