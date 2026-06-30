const express = require('express');
const { getSections, createSection, updateSection, deleteSection } = require('../controllers/sectionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.route('/')
  .get(protect, authorize('admin'), getSections)
  .post(protect, authorize('admin'), createSection);
router.route('/:id')
  .put(protect, authorize('admin'), updateSection)
  .delete(protect, authorize('admin'), deleteSection);

module.exports = router;