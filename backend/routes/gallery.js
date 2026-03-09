const express = require('express');
const router = express.Router();
const {
  getGallery,
  getFeatured,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getCategories,
} = require('../controllers/galleryController');
const { protect, authorize } = require('../middleware/auth');
const { uploadGallery, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/', getGallery);
router.get('/featured', getFeatured);
router.get('/categories', getCategories);
router.get('/:id', getItem);

// Admin routes
router.post('/admin', protect, authorize('admin'), uploadGallery, handleUploadError, createItem);
router.put('/admin/:id', protect, authorize('admin'), uploadGallery, handleUploadError, updateItem);
router.delete('/admin/:id', protect, authorize('admin'), deleteItem);

module.exports = router;
