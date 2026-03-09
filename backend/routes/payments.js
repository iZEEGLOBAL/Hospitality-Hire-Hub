const express = require('express');
const router = express.Router();
const {
  getPlans,
  initializePayment,
  verifyPayment,
  confirmPayment,
  getPaymentHistory,
  getSubscription,
  cancelSubscription,
  getAllPayments,
  approvePayment,
  rejectPayment,
  processRefund,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/plans', getPlans);

// Protected routes
router.post('/initialize', protect, initializePayment);
router.post('/verify', protect, verifyPayment);
router.post('/confirm', protect, confirmPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/subscription', protect, getSubscription);
router.post('/cancel-subscription', protect, cancelSubscription);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllPayments);
router.put('/admin/:id/approve', protect, authorize('admin'), approvePayment);
router.put('/admin/:id/reject', protect, authorize('admin'), rejectPayment);
router.post('/admin/:id/refund', protect, authorize('admin'), processRefund);

module.exports = router;
