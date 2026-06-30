const express = require('express');
const {
  getReviewsByCourse,
  createReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/course/:courseId')
  .get(protect, getReviewsByCourse);

router.route('/')
  .post(protect, authorize('student'), createReview);

router.route('/:id')
  .delete(protect, deleteReview);

module.exports = router;