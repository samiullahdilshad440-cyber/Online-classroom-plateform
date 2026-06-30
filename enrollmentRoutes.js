const express = require('express');
const { enrollCourse, updateProgress, getMyCourses } = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/my-courses').get(protect, authorize('student'), getMyCourses);
router.route('/:courseId').post(protect, authorize('student'), enrollCourse);
router.route('/:courseId/progress').patch(protect, authorize('student'), updateProgress);

module.exports = router;