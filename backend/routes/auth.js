const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
} = require('../middleware/validation');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.put('/reset-password/:resetToken', validateResetPassword, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, validateProfileUpdate, updateProfile);
router.put('/update-password', protect, validateChangePassword, updatePassword);
router.post('/logout', protect, logout);

module.exports = router;
