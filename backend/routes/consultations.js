const express = require('express');
const router = express.Router();
const {
  createConsultation,
  getMyConsultations,
  getConsultation,
  cancelConsultation,
  submitFeedback,
  getAllConsultations,
  getConsultationById,
  updateStatus,
  scheduleConsultation,
  addNotes,
  addCommunication,
  setCost,
  markAsPaid,
} = require('../controllers/consultationController');
const { protect, authorize } = require('../middleware/auth');
const { validateConsultation } = require('../middleware/validation');

// Protected routes - Clients
router.post('/', protect, validateConsultation, createConsultation);
router.get('/my', protect, getMyConsultations);
router.get('/:id', protect, getConsultation);
router.put('/:id/cancel', protect, cancelConsultation);
router.post('/:id/feedback', protect, submitFeedback);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllConsultations);
router.get('/admin/:id', protect, authorize('admin'), getConsultationById);
router.put('/admin/:id/status', protect, authorize('admin'), updateStatus);
router.put('/admin/:id/schedule', protect, authorize('admin'), scheduleConsultation);
router.put('/admin/:id/notes', protect, authorize('admin'), addNotes);
router.post('/admin/:id/communication', protect, authorize('admin'), addCommunication);
router.put('/admin/:id/cost', protect, authorize('admin'), setCost);
router.put('/admin/:id/mark-paid', protect, authorize('admin'), markAsPaid);

module.exports = router;
