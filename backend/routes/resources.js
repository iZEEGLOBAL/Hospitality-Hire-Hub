const express = require('express');
const router = express.Router();
const {
  getResources,
  getResource,
  downloadResource,
  getFeaturedResources,
  getResourcesByCategory,
  getCategories,
  getResourceTypes,
  addReview,
  createResource,
  updateResource,
  deleteResource,
  getAllResources,
} = require('../controllers/resourceController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadResource, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/', getResources);
router.get('/featured', getFeaturedResources);
router.get('/categories', getCategories);
router.get('/types', getResourceTypes);
router.get('/category/:category', getResourcesByCategory);
router.get('/:id', optionalAuth, getResource);

// Protected routes
router.get('/:id/download', protect, downloadResource);
router.post('/:id/reviews', protect, addReview);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllResources);
router.post('/admin', protect, authorize('admin'), uploadResource, handleUploadError, createResource);
router.put('/admin/:id', protect, authorize('admin'), uploadResource, handleUploadError, updateResource);
router.delete('/admin/:id', protect, authorize('admin'), deleteResource);

module.exports = router;
