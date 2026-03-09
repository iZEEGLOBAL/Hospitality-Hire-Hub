const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // Payment Reference
    reference: {
      type: String,
      unique: true,
      required: true,
    },

    // User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // User Info (denormalized)
    userName: String,
    userEmail: String,

    // Payment Type
    type: {
      type: String,
      enum: ['subscription', 'consultation', 'resource', 'other'],
      required: true,
    },

    // Payment For
    paymentFor: {
      plan: {
        type: String,
        enum: ['free', 'pro', 'business'],
      },
      consultationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultation',
      },
      resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
      },
      duration: String, // for subscriptions: monthly, yearly
    },

    // Amount
    amount: {
      type: Number,
      required: true,
    },

    // Currency
    currency: {
      type: String,
      default: 'NGN',
    },

    // Payment Method
    method: {
      type: String,
      enum: ['paystack', 'bank_transfer', 'usdt_trc20', 'usdt_erc20', 'other'],
      required: true,
    },

    // Payment Method Details
    methodDetails: {
      // For bank transfer
      bankName: String,
      accountNumber: String,
      accountName: String,
      transferReference: String,

      // For crypto
      walletAddress: String,
      transactionHash: String,
      network: String,

      // For Paystack
      paystackReference: String,
      authorizationCode: String,
      cardType: String,
      last4: String,
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
    },

    // Payment Date
    paidAt: Date,

    // Failure Reason
    failureReason: String,

    // Refund Details
    refund: {
      amount: Number,
      reason: String,
      refundedAt: Date,
      refundedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },

    // Subscription Details (if applicable)
    subscription: {
      startDate: Date,
      endDate: Date,
      isActive: Boolean,
      autoRenew: {
        type: Boolean,
        default: false,
      },
    },

    // Metadata
    metadata: {
      ipAddress: String,
      userAgent: String,
      country: String,
    },

    // Receipt URL
    receiptUrl: String,

    // Invoice Number
    invoiceNumber: String,

    // Notes
    notes: String,

    // Processed By (for manual payments)
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Processed At
    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ 'paymentFor.plan': 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
