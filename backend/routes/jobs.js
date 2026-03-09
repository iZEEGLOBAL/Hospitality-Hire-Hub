const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  getJobBySlug,
  getFeaturedJobs,
  getRecentJobs,
  getUrgentJobs,
  getJobStats,
  getRelatedJobs,
  getDepartments,
  getJobTypes,
  getExperienceLevels,
} = require('../controllers/jobController');
const { optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', getJobs);
router.get('/featured', getFeaturedJobs);
router.get('/recent', getRecentJobs);
router.get('/urgent', getUrgentJobs);
router.get('/stats', getJobStats);
router.get('/departments', getDepartments);
router.get('/types', getJobTypes);
router.get('/experience-levels', getExperienceLevels);
router.get('/slug/:slug', optionalAuth, getJobBySlug);
router.get('/:id/related', getRelatedJobs);
router.get('/:id', optionalAuth, getJob);

module.exports = router;
