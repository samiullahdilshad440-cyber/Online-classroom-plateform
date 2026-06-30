const express = require('express');
const {
  getQuizzesByCourse,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/course/:courseId')
  .get(protect, getQuizzesByCourse);

router.route('/')
  .post(protect, authorize('teacher', 'admin'), createQuiz);

router.route('/:id')
  .get(protect, getQuiz)
  .put(protect, authorize('teacher', 'admin'), updateQuiz)
  .delete(protect, authorize('teacher', 'admin'), deleteQuiz);

module.exports = router;