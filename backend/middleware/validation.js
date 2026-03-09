const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// User registration validation
exports.validateRegister = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['jobseeker', 'employer', 'consultation_client'])
    .withMessage('Invalid role'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors,
];

// User login validation
exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

// Job creation validation
exports.validateJob = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ max: 200 })
    .withMessage('Job title must not exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required'),
  body('requirements')
    .trim()
    .notEmpty()
    .withMessage('Job requirements are required'),
  body('department')
    .notEmpty()
    .withMessage('Department is required')
    .isIn([
      'front_office',
      'housekeeping',
      'kitchen',
      'food_beverage',
      'management',
      'maintenance',
      'security',
      'spa_wellness',
      'sales_marketing',
      'accounting',
      'human_resources',
    ])
    .withMessage('Invalid department'),
  body('jobType')
    .notEmpty()
    .withMessage('Job type is required')
    .isIn(['full_time', 'part_time', 'contract', 'temporary', 'internship'])
    .withMessage('Invalid job type'),
  body('location.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('experienceLevel')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'executive'])
    .withMessage('Invalid experience level'),
  handleValidationErrors,
];

// Consultation booking validation
exports.validateConsultation = [
  body('businessName')
    .trim()
    .notEmpty()
    .withMessage('Business name is required'),
  body('businessType')
    .notEmpty()
    .withMessage('Business type is required')
    .isIn(['hotel', 'restaurant', 'resort', 'catering', 'event_venue', 'spa', 'other'])
    .withMessage('Invalid business type'),
  body('propertyDescription')
    .trim()
    .notEmpty()
    .withMessage('Property description is required'),
  body('type')
    .notEmpty()
    .withMessage('Consultation type is required')
    .isIn(['online', 'physical'])
    .withMessage('Invalid consultation type'),
  body('preferredDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('preferredTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
  handleValidationErrors,
];

// Post creation validation
exports.validatePost = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Post content is required')
    .isLength({ max: 5000 })
    .withMessage('Content must not exceed 5000 characters'),
  body('type')
    .optional()
    .isIn(['discussion', 'question', 'experience', 'advice', 'news', 'other'])
    .withMessage('Invalid post type'),
  body('category')
    .optional()
    .isIn([
      'general',
      'career_advice',
      'interview_tips',
      'industry_news',
      'job_search',
      'workplace',
      'training',
      'certification',
      'hospitality_trends',
      'success_stories',
      'help',
    ])
    .withMessage('Invalid category'),
  handleValidationErrors,
];

// Comment validation
exports.validateComment = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 2000 })
    .withMessage('Comment must not exceed 2000 characters'),
  handleValidationErrors,
];

// Password reset validation
exports.validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors,
];

// Reset password validation
exports.validateResetPassword = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  handleValidationErrors,
];

// Change password validation
exports.validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors,
];

// Profile update validation
exports.validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Bio must not exceed 2000 characters'),
  handleValidationErrors,
];
