const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  getUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getJobs,
  updateJobStatus,
  deleteJob,
  getAnalytics,
  getRecentActivities,
  approveEmployer,
  getCertifiedCandidates,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and for admins only
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/activities', getRecentActivities);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Jobs
router.get('/jobs', getJobs);
router.put('/jobs/:id/status', updateJobStatus);
router.delete('/jobs/:id', deleteJob);

// Employers
router.put('/employers/:id/approve', approveEmployer);

// Certified candidates
router.get('/certified-candidates', getCertifiedCandidates);

module.exports = router;
