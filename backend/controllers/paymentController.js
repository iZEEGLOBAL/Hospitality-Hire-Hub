const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/Payment');
const User = require('../models/User');
const {
  initializeTransaction,
  verifyTransaction,
  createPlan,
  createSubscription,
} = require('../utils/paystack');

// Subscription plans
const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: { NGN: 0, USD: 0 },
    features: ['Basic profile', 'Browse jobs', 'Limited resources'],
  },
  pro: {
    name: 'Pro',
    price: { NGN: 5000, USD: 10 },
    yearlyPrice: { NGN: 50000, USD: 100 },
    features: [
      'Full profile access',
      'Apply to jobs',
      'Certification interviews',
      'All training courses',
      'Premium resources',
    ],
  },
  business: {
    name: 'Business',
    price: { NGN: 25000, USD: 50 },
    yearlyPrice: { NGN: 250000, USD: 500 },
    features: [
      'Post jobs',
      'Search certified candidates',
      'Contact candidates',
      'Priority support',
      'Analytics dashboard',
    ],
  },
};

// @desc    Get subscription plans
// @route   GET /api/payments/plans
// @access  Public
exports.getPlans = async (req, res) => {
  try {
    // Detect country from IP or user preference
    const country = req.query.country || 'NG';
    const currency = country === 'NG' ? 'NGN' : 'USD';

    const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      price: plan.price[currency],
      yearlyPrice: plan.yearlyPrice?.[currency],
      currency,
      features: plan.features,
    }));

    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plans',
      error: error.message,
    });
  }
};

// @desc    Initialize payment
// @route   POST /api/payments/initialize
// @access  Private
exports.initializePayment = async (req, res) => {
  try {
    const { plan, duration, method } = req.body;

    const user = await User.findById(req.user.id);

    // Validate plan
    if (!SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan',
      });
    }

    // Check if user already has this plan
    if (user.subscription.plan === plan && user.subscription.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription for this plan',
      });
    }

    // Calculate amount
    const country = user.country === 'Nigeria' ? 'NG' : 'NG';
    const currency = country === 'NG' ? 'NGN' : 'USD';
    const planData = SUBSCRIPTION_PLANS[plan];
    const amount =
      duration === 'yearly'
        ? planData.yearlyPrice?.[currency] || planData.price[currency] * 10
        : planData.price[currency];

    // Generate reference
    const reference = `HHH-${uuidv4()}`;

    // Create payment record
    const payment = await Payment.create({
      reference,
      user: req.user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      type: 'subscription',
      paymentFor: {
        plan,
        duration: duration || 'monthly',
      },
      amount,
      currency,
      method,
      status: 'pending',
    });

    // Initialize based on payment method
    let paymentData = {};

    if (method === 'paystack') {
      const paystackResponse = await initializeTransaction(
        user.email,
        amount,
        {
          reference,
          plan,
          duration,
          userId: req.user.id,
        }
      );

      paymentData = {
        authorizationUrl: paystackResponse.data.authorization_url,
        reference: paystackResponse.data.reference,
      };
    } else if (method === 'usdt_trc20') {
      // Return crypto payment details
      paymentData = {
        walletAddress: process.env.USDT_TRC20_WALLET,
        amount: amount / 1500, // Approximate conversion rate
        currency: 'USDT',
        network: 'TRC20',
        reference,
      };
    } else if (method === 'bank_transfer') {
      // Return bank details
      paymentData = {
        bankName: process.env.BANK_NAME,
        accountNumber: process.env.BANK_ACCOUNT_NUMBER,
        accountName: process.env.BANK_ACCOUNT_NAME,
        reference,
        amount,
        currency,
      };
    }

    res.json({
      success: true,
      message: 'Payment initialized',
      data: {
        payment,
        paymentData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error initializing payment',
      error: error.message,
    });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    const payment = await Payment.findOne({ reference });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status === 'completed') {
      return res.json({
        success: true,
        message: 'Payment already verified',
        data: payment,
      });
    }

    // Verify based on method
    if (payment.method === 'paystack') {
      const verification = await verifyTransaction(reference);

      if (verification.data.status === 'success') {
        payment.status = 'completed';
        payment.paidAt = new Date();
        payment.methodDetails = {
          paystackReference: verification.data.reference,
          authorizationCode: verification.data.authorization?.authorization_code,
          cardType: verification.data.authorization?.card_type,
          last4: verification.data.authorization?.last4,
        };

        // Update subscription
        await updateUserSubscription(payment);
      } else {
        payment.status = 'failed';
        payment.failureReason = verification.data.gateway_response;
      }
    }

    await payment.save();

    res.json({
      success: true,
      message: payment.status === 'completed' ? 'Payment verified' : 'Payment verification failed',
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message,
    });
  }
};

// @desc    Confirm bank transfer / crypto payment (manual)
// @route   POST /api/payments/confirm
// @access  Private
exports.confirmPayment = async (req, res) => {
  try {
    const { reference, transactionDetails } = req.body;

    const payment = await Payment.findOne({ reference });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed',
      });
    }

    // Update with transaction details
    payment.status = 'processing';
    payment.methodDetails = {
      ...payment.methodDetails,
      ...transactionDetails,
    };
    await payment.save();

    res.json({
      success: true,
      message: 'Payment confirmation submitted. Waiting for admin approval.',
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message,
    });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      count: payments.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history',
      error: error.message,
    });
  }
};

// @desc    Get current subscription
// @route   GET /api/payments/subscription
// @access  Private
exports.getSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        plan: user.subscription.plan,
        status: user.subscription.status,
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate,
        daysRemaining: user.subscription.endDate
          ? Math.max(0, Math.ceil((new Date(user.subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription',
      error: error.message,
    });
  }
};

// @desc    Cancel subscription
// @route   POST /api/payments/cancel-subscription
// @access  Private
exports.cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.subscription.plan === 'free') {
      return res.status(400).json({
        success: false,
        message: 'No active subscription to cancel',
      });
    }

    user.subscription.status = 'cancelled';
    await user.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription',
      error: error.message,
    });
  }
};

// Helper function to update user subscription
async function updateUserSubscription(payment) {
  const user = await User.findById(payment.user);

  const duration = payment.paymentFor.duration === 'yearly' ? 365 : 30;

  user.subscription = {
    plan: payment.paymentFor.plan,
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
    paymentMethod: payment.method,
    transactionId: payment.reference,
  };

  await user.save();

  // Update payment subscription details
  payment.subscription = {
    startDate: user.subscription.startDate,
    endDate: user.subscription.endDate,
    isActive: true,
  };
  await payment.save();
}

// ==================== ADMIN ROUTES ====================

// @desc    Get all payments
// @route   GET /api/payments/admin
// @access  Private (Admin)
exports.getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      count: payments.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message,
    });
  }
};

// @desc    Approve payment (for manual payments)
// @route   PUT /api/payments/admin/:id/approve
// @access  Private (Admin)
exports.approvePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status !== 'processing') {
      return res.status(400).json({
        success: false,
        message: 'Payment cannot be approved',
      });
    }

    payment.status = 'completed';
    payment.paidAt = new Date();
    payment.processedBy = req.user.id;
    payment.processedAt = new Date();

    await payment.save();

    // Update user subscription
    await updateUserSubscription(payment);

    res.json({
      success: true,
      message: 'Payment approved successfully',
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving payment',
      error: error.message,
    });
  }
};

// @desc    Reject payment
// @route   PUT /api/payments/admin/:id/reject
// @access  Private (Admin)
exports.rejectPayment = async (req, res) => {
  try {
    const { reason } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    payment.status = 'failed';
    payment.failureReason = reason;
    payment.processedBy = req.user.id;
    payment.processedAt = new Date();

    await payment.save();

    res.json({
      success: true,
      message: 'Payment rejected',
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting payment',
      error: error.message,
    });
  }
};

// @desc    Process refund
// @route   POST /api/payments/admin/:id/refund
// @access  Private (Admin)
exports.processRefund = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded',
      });
    }

    payment.status = 'refunded';
    payment.refund = {
      amount: amount || payment.amount,
      reason,
      refundedAt: new Date(),
      refundedBy: req.user.id,
    };

    await payment.save();

    // Update user subscription if full refund
    if (amount >= payment.amount) {
      const user = await User.findById(payment.user);
      user.subscription.status = 'cancelled';
      await user.save();
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message,
    });
  }
};
