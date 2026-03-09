const express = require('express');
const router = express.Router();
const {
  getFAQs,
  getFAQ,
  markHelpful,
  getCategories,
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  toggleStatus,
} = require('../controllers/faqController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getFAQs);
router.get('/categories', getCategories);
router.get('/:id', getFAQ);
router.post('/:id/helpful', markHelpful);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllFAQs);
router.post('/admin', protect, authorize('admin'), createFAQ);
router.put('/admin/:id', protect, authorize('admin'), updateFAQ);
router.delete('/admin/:id', protect, authorize('admin'), deleteFAQ);
router.put('/admin/:id/status', protect, authorize('admin'), toggleStatus);

module.exports = router;
