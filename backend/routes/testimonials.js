const express = require('express');
const router = express.Router();
const {
  getTestimonials,
  getFeatured,
  getTestimonial,
  submitTestimonial,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  approveTestimonial,
  rejectTestimonial,
  featureTestimonial,
} = require('../controllers/testimonialController');
const { protect, authorize } = require('../middleware/auth');
const { uploadPhoto, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/', getTestimonials);
router.get('/featured', getFeatured);
router.get('/:id', getTestimonial);

// Protected routes
router.post('/', protect, submitTestimonial);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllTestimonials);
router.post('/admin', protect, authorize('admin'), uploadPhoto, handleUploadError, createTestimonial);
router.put('/admin/:id', protect, authorize('admin'), uploadPhoto, handleUploadError, updateTestimonial);
router.delete('/admin/:id', protect, authorize('admin'), deleteTestimonial);
router.put('/admin/:id/approve', protect, authorize('admin'), approveTestimonial);
router.put('/admin/:id/reject', protect, authorize('admin'), rejectTestimonial);
router.put('/admin/:id/feature', protect, authorize('admin'), featureTestimonial);

module.exports = router;
