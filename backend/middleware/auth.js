const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.',
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check if user has active subscription
exports.requireSubscription = (...plans) => {
  return (req, res, next) => {
    const userPlan = req.user.subscription?.plan || 'free';
    const userStatus = req.user.subscription?.status || 'inactive';

    // Check if user's plan is in allowed plans
    if (!plans.includes(userPlan)) {
      return res.status(403).json({
        success: false,
        message: 'This feature requires a subscription upgrade',
        requiredPlans: plans,
        currentPlan: userPlan,
      });
    }

    // Check if subscription is active
    if (userStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your subscription is not active. Please renew your subscription.',
        subscriptionStatus: userStatus,
      });
    }

    // Check if subscription has expired
    if (req.user.subscription?.endDate && new Date() > new Date(req.user.subscription.endDate)) {
      return res.status(403).json({
        success: false,
        message: 'Your subscription has expired. Please renew your subscription.',
      });
    }

    next();
  };
};

// Optional auth - doesn't require token but adds user if token exists
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
      } catch (error) {
        // Token invalid, but continue without user
        req.user = null;
      }
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};
