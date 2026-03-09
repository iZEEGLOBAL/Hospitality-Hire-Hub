const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phone, country } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'jobseeker',
      phone,
      country,
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email (optional, can be enabled)
    // const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Verify your email',
    //   html: `<p>Please click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    // });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        photo: user.photo,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      whatsapp: req.body.whatsapp,
      country: req.body.country,
      state: req.body.state,
      city: req.body.city,
      address: req.body.address,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating password',
      error: error.message,
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: message,
      });

      res.json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing request',
      error: error.message,
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message,
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token',
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message,
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // In a stateless JWT setup, logout is handled client-side
    // But we can add token to a blacklist if needed
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message,
    });
  }
};
