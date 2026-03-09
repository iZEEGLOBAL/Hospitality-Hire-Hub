const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    // Client
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Client Info (denormalized)
    clientName: String,
    clientEmail: String,
    clientPhone: String,

    // Business Info
    businessName: {
      type: String,
      required: true,
    },
    businessType: {
      type: String,
      enum: [
        'hotel',
        'restaurant',
        'resort',
        'catering',
        'event_venue',
        'spa',
        'other',
      ],
    },
    businessLocation: {
      country: String,
      state: String,
      city: String,
      address: String,
    },

    // Property Description
    propertyDescription: {
      type: String,
      required: true,
    },

    // Consultation Type
    type: {
      type: String,
      enum: ['online', 'physical'],
      required: true,
    },

    // Preferred Date & Time
    preferredDate: Date,
    preferredTime: String,

    // Alternative Date & Time
    alternativeDate: Date,
    alternativeTime: String,

    // Consultation Topics
    topics: [String],

    // Specific Requirements
    specificRequirements: String,

    // Status
    status: {
      type: String,
      enum: [
        'pending',
        'under_review',
        'scheduled',
        'confirmed',
        'completed',
        'cancelled',
        'rescheduled',
      ],
      default: 'pending',
    },

    // Scheduled Details
    scheduledDate: Date,
    scheduledTime: String,
    duration: {
      type: Number,
      default: 60, // minutes
    },

    // Meeting Details (for online)
    meetingDetails: {
      platform: String,
      link: String,
      meetingId: String,
      password: String,
    },

    // Physical Location (for physical consultation)
    physicalLocation: {
      address: String,
      contactPerson: String,
      contactPhone: String,
    },

    // Assigned Consultant
    assignedConsultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Consultant Notes
    consultantNotes: String,

    // Client Feedback
    clientFeedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      submittedAt: Date,
    },

    // Follow-up Required
    followUpRequired: {
      type: Boolean,
      default: false,
    },

    // Follow-up Details
    followUpDetails: String,

    // Cost
    cost: {
      amount: Number,
      currency: {
        type: String,
        default: 'NGN',
      },
      isPaid: {
        type: Boolean,
        default: false,
      },
      paidAt: Date,
      transactionId: String,
    },

    // Documents
    documents: [
      {
        name: String,
        url: String,
        publicId: String,
        uploadedAt: Date,
      },
    ],

    // Communication History
    communicationHistory: [
      {
        type: {
          type: String,
          enum: ['email', 'phone', 'whatsapp', 'in_app'],
        },
        message: String,
        sentBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Cancellation Reason
    cancellationReason: String,

    // Cancelled By
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Completed At
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
consultationSchema.index({ client: 1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ createdAt: -1 });
consultationSchema.index({ scheduledDate: 1 });

const Consultation = mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;
