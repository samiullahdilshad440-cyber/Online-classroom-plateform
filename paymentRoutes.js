const express = require('express');
const { createPayment, getMyPayments, getAllPayments } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, authorize('student'), createPayment);

router.route('/my')
  .get(protect, authorize('student'), getMyPayments);

router.route('/')
  .get(protect, authorize('admin'), getAllPayments);

module.exports = router;