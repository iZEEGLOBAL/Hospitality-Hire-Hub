const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
  {
    // Job
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },

    // Job Seeker
    jobSeeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Employer
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Cover Letter
    coverLetter: {
      type: String,
      maxlength: 5000,
    },

    // Expected Salary
    expectedSalary: {
      amount: Number,
      currency: String,
      period: String,
    },

    // Availability
    availability: {
      type: String,
      enum: ['immediately', '1_week', '2_weeks', '1_month', 'negotiable'],
    },

    // Status
    status: {
      type: String,
      enum: [
        'pending',
        'reviewing',
        'shortlisted',
        'interview_scheduled',
        'interviewed',
        'offered',
        'hired',
        'rejected',
        'withdrawn',
      ],
      default: 'pending',
    },

    // Application Status History
    statusHistory: [
      {
        status: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        notes: String,
      },
    ],

    // Interview Details
    interview: {
      scheduledAt: Date,
      type: {
        type: String,
        enum: ['phone', 'video', 'in_person'],
      },
      location: String,
      meetingLink: String,
      notes: String,
      interviewerName: String,
      interviewerEmail: String,
      interviewerPhone: String,
    },

    // Employer Notes
    employerNotes: {
      type: String,
      select: false, // Only visible to employer
    },

    // Rating (by employer)
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
      },
      notes: String,
    },

    // Withdrawn Reason
    withdrawnReason: String,

    // Rejection Reason
    rejectionReason: String,

    // Viewed by employer
    isViewed: {
      type: Boolean,
      default: false,
    },

    // Viewed at
    viewedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate applications
jobApplicationSchema.index({ job: 1, jobSeeker: 1 }, { unique: true });
jobApplicationSchema.index({ employer: 1, status: 1 });
jobApplicationSchema.index({ jobSeeker: 1, status: 1 });
jobApplicationSchema.index({ createdAt: -1 });

// Pre-save middleware to track status changes
jobApplicationSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }
  next();
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = JobApplication;
