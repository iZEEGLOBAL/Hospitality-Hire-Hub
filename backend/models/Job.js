const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    // Job Basic Info
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },

    // Employer
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Company Info (denormalized for faster queries)
    companyName: String,
    companyLogo: String,

    // Job Description
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: 10000,
    },

    // Requirements
    requirements: {
      type: String,
      required: [true, 'Job requirements are required'],
    },

    // Responsibilities
    responsibilities: String,

    // Benefits
    benefits: String,

    // Department
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: [
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
      ],
    },

    // Job Type
    jobType: {
      type: String,
      required: [true, 'Job type is required'],
      enum: ['full_time', 'part_time', 'contract', 'temporary', 'internship'],
    },

    // Experience Level
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'executive'],
      default: 'entry',
    },

    // Minimum Experience (years)
    minExperience: {
      type: Number,
      default: 0,
    },

    // Location
    location: {
      country: {
        type: String,
        required: true,
      },
      state: String,
      city: {
        type: String,
        required: true,
      },
      address: String,
      isRemote: {
        type: Boolean,
        default: false,
      },
    },

    // Salary
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'NGN',
      },
      period: {
        type: String,
        enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
        default: 'monthly',
      },
      isNegotiable: {
        type: Boolean,
        default: false,
      },
    },

    // Required Skills
    requiredSkills: [String],

    // Required Certifications
    requiredCertifications: [String],

    // Education Requirements
    educationRequirements: String,

    // Language Requirements
    languageRequirements: [
      {
        language: String,
        proficiency: {
          type: String,
          enum: ['basic', 'conversational', 'fluent', 'native'],
        },
      },
    ],

    // Number of Openings
    openings: {
      type: Number,
      default: 1,
    },

    // Application Deadline
    applicationDeadline: Date,

    // Status
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'closed', 'expired'],
      default: 'draft',
    },

    // Featured Job
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Urgent Hiring
    isUrgent: {
      type: Boolean,
      default: false,
    },

    // Views Count
    views: {
      type: Number,
      default: 0,
    },

    // Applications Count
    applicationsCount: {
      type: Number,
      default: 0,
    },

    // Published Date
    publishedAt: Date,

    // Closed Date
    closedAt: Date,

    // Application Instructions
    applicationInstructions: String,

    // Contact Email
    contactEmail: String,

    // Contact Phone
    contactPhone: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
jobSchema.index({ status: 1, publishedAt: -1 });
jobSchema.index({ department: 1 });
jobSchema.index({ "location.country": 1, "location.city": 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ employer: 1 });
jobSchema.index({ isFeatured: 1 });
jobSchema.index({ title: 'text', description: 'text' });

// Virtual for applications
jobSchema.virtual('applications', {
  ref: 'JobApplication',
  localField: '_id',
  foreignField: 'job',
});

// Generate slug before saving
jobSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36);
  }

  // Set publishedAt when status changes to active
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Set closedAt when status changes to closed
  if (this.isModified('status') && this.status === 'closed' && !this.closedAt) {
    this.closedAt = new Date();
  }

  next();
});

// Method to increment views
jobSchema.methods.incrementViews = async function () {
  this.views += 1;
  await this.save();
};

// Static method to get active jobs
jobSchema.statics.getActiveJobs = function (filters = {}) {
  return this.find({
    status: 'active',
    ...filters,
  }).sort({ isFeatured: -1, publishedAt: -1 });
};

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;

