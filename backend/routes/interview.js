const express = require('express');
const router = express.Router();
const {
  getQuestions,
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
  getSession,
  abandonInterview,
  getDepartments,
  getCertificate,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllQuestions,
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/departments', getDepartments);

// Protected routes - Job Seekers
router.get('/questions/:department', protect, authorize('jobseeker'), getQuestions);
router.post('/start', protect, authorize('jobseeker'), startInterview);
router.post('/:sessionId/answer', protect, authorize('jobseeker'), submitAnswer);
router.post('/:sessionId/complete', protect, authorize('jobseeker'), completeInterview);
router.get('/history', protect, authorize('jobseeker'), getInterviewHistory);
router.get('/:sessionId', protect, authorize('jobseeker'), getSession);
router.put('/:sessionId/abandon', protect, authorize('jobseeker'), abandonInterview);
router.get('/certificate/:sessionId', protect, authorize('jobseeker'), getCertificate);

// Admin routes
router.get('/admin/questions', protect, authorize('admin'), getAllQuestions);
router.post('/admin/questions', protect, authorize('admin'), createQuestion);
router.put('/admin/questions/:id', protect, authorize('admin'), updateQuestion);
router.delete('/admin/questions/:id', protect, authorize('admin'), deleteQuestion);

module.exports = router;
