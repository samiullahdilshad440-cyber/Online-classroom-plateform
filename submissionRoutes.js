const express = require('express');
const {
  submitAssignment,
  getMySubmissions,
  gradeSubmission,
  getCourseSubmissions
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/multer');

const router = express.Router();

router.route('/')
  .post(protect, authorize('student'), upload.single('file'), submitAssignment);

router.route('/my/:courseId')
  .get(protect, authorize('student'), getMySubmissions);

router.route('/course/:courseId')
  .get(protect, authorize('teacher', 'admin'), getCourseSubmissions);

router.route('/:id/grade')
  .patch(protect, authorize('teacher', 'admin'), gradeSubmission);

module.exports = router;