const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  getCourseBySlug,
  getFeaturedCourses,
  getDepartments,
  createCourse,
  updateCourse,
  deleteCourse,
  getAllCourses,
} = require('../controllers/courseController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadPhoto, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/', getCourses);
router.get('/featured', getFeaturedCourses);
router.get('/departments', getDepartments);
router.get('/slug/:slug', getCourseBySlug);
router.get('/:id', optionalAuth, getCourse);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllCourses);
router.post('/admin', protect, authorize('admin'), uploadPhoto, handleUploadError, createCourse);
router.put('/admin/:id', protect, authorize('admin'), uploadPhoto, handleUploadError, updateCourse);
router.delete('/admin/:id', protect, authorize('admin'), deleteCourse);

module.exports = router;
