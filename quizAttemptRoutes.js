const express = require('express');
const {
  submitQuizAttempt,
  getMyAttempts,
  getQuizAttempts
} = require('../controllers/quizAttemptController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, authorize('student'), submitQuizAttempt);

router.route('/my')
  .get(protect, authorize('student'), getMyAttempts);

router.route('/quiz/:quizId')
  .get(protect, authorize('teacher', 'admin'), getQuizAttempts);

module.exports = router;