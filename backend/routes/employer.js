const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadLogo,
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  closeJob,
  getApplications,
  updateApplicationStatus,
  scheduleInterview,
  searchCandidates,
  getCandidate,
  sendInterviewRequest,
  getDashboardStats,
} = require('../controllers/employerController');
const { protect, authorize } = require('../middleware/auth');
const { validateJob } = require('../middleware/validation');
const {
  uploadCompanyLogo,
  handleUploadError,
} = require('../middleware/upload');

// All routes are protected and for employers only
router.use(protect);
router.use(authorize('employer'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/logo', uploadCompanyLogo, handleUploadError, uploadLogo);

// Job routes
router.post('/jobs', validateJob, createJob);
router.get('/jobs', getJobs);
router.get('/jobs/:id', getJob);
router.put('/jobs/:id', validateJob, updateJob);
router.delete('/jobs/:id', deleteJob);
router.put('/jobs/:id/close', closeJob);

// Application routes
router.get('/jobs/:id/applications', getApplications);
router.put('/applications/:id/status', updateApplicationStatus);
router.put('/applications/:id/schedule-interview', scheduleInterview);

// Candidate routes
router.get('/candidates', searchCandidates);
router.get('/candidates/:id', getCandidate);
router.post('/candidates/:id/interview-request', sendInterviewRequest);

// Dashboard
router.get('/dashboard', getDashboardStats);

module.exports = router;
