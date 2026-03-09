const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadCV,
  uploadPhoto,
  uploadCertificate,
  deleteCertificate,
  getApplications,
  applyForJob,
  withdrawApplication,
  getSavedJobs,
  saveJob,
  unsaveJob,
  getEnrolledCourses,
  enrollInCourse,
  updateCourseProgress,
  getFreeResources,
  getDashboardStats,
} = require('../controllers/jobSeekerController');
const { protect, authorize } = require('../middleware/auth');
const {
  uploadCV: uploadCVMiddleware,
  uploadPhoto: uploadPhotoMiddleware,
  uploadCertificate: uploadCertMiddleware,
  handleUploadError,
} = require('../middleware/upload');

// All routes are protected and for job seekers only
router.use(protect);
router.use(authorize('jobseeker'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/cv', uploadCVMiddleware, handleUploadError, uploadCV);
router.post('/photo', uploadPhotoMiddleware, handleUploadError, uploadPhoto);
router.post('/certificates', uploadCertMiddleware, handleUploadError, uploadCertificate);
router.delete('/certificates/:index', deleteCertificate);

// Job application routes
router.get('/applications', getApplications);
router.post('/apply/:jobId', applyForJob);
router.put('/applications/:id/withdraw', withdrawApplication);

// Saved jobs routes
router.get('/saved-jobs', getSavedJobs);
router.post('/save-job/:jobId', saveJob);
router.delete('/save-job/:jobId', unsaveJob);

// Course routes
router.get('/courses', getEnrolledCourses);
router.post('/enroll/:courseId', enrollInCourse);
router.put('/course-progress/:enrollmentId', updateCourseProgress);

// Resources routes
router.get('/resources/free', getFreeResources);

// Dashboard
router.get('/dashboard', getDashboardStats);

module.exports = router;
