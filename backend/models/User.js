const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },

    // Role
    role: {
      type: String,
      enum: ['admin', 'jobseeker', 'employer', 'consultation_client'],
      default: 'jobseeker',
    },

    // Profile Photo
    photo: {
      url: String,
      publicId: String,
    },

    // Location
    country: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },

    // Subscription
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'pro', 'business'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'expired'],
        default: 'active',
      },
      startDate: Date,
      endDate: Date,
      paymentMethod: String,
      transactionId: String,
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Last Login
    lastLogin: Date,

    // ========== JOB SEEKER SPECIFIC FIELDS ==========
    jobSeekerProfile: {
      // Professional Info
      professionalTitle: String,
      yearsOfExperience: {
        type: Number,
        default: 0,
      },
      currentSalary: Number,
      expectedSalary: Number,
      currency: {
        type: String,
        default: 'NGN',
      },

      // Bio
      bio: {
        type: String,
        maxlength: 2000,
      },

      // Skills
      skills: [String],

      // Languages
      languages: [
        {
          language: String,
          proficiency: {
            type: String,
            enum: ['basic', 'conversational', 'fluent', 'native'],
          },
        },
      ],

      // Department Preferences
      preferredDepartments: [
        {
          type: String,
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
      ],

      // Work Experience
      workExperience: [
        {
          companyName: String,
          position: String,
          department: String,
          location: String,
          startDate: Date,
          endDate: Date,
          isCurrentJob: Boolean,
          responsibilities: String,
        },
      ],

      // Education
      education: [
        {
          institution: String,
          degree: String,
          fieldOfStudy: String,
          startDate: Date,
          endDate: Date,
          grade: String,
        },
      ],

      // Certifications
      certifications: [
        {
          name: String,
          issuingOrganization: String,
          issueDate: Date,
          expiryDate: Date,
          credentialId: String,
          documentUrl: String,
          documentPublicId: String,
        },
      ],

      // CV/Resume
      cv: {
        url: String,
        publicId: String,
        originalName: String,
        uploadDate: Date,
      },

      // Passport Photo
      passportPhoto: {
        url: String,
        publicId: String,
      },

      // Availability
      availability: {
        type: String,
        enum: ['immediately', '1_week', '2_weeks', '1_month', 'negotiable'],
      },

      // Willing to relocate
      willingToRelocate: {
        type: Boolean,
        default: false,
      },

      // Certification Status
      certificationStatus: {
        type: String,
        enum: ['none', 'in_progress', 'passed', 'failed'],
        default: 'none',
      },

      // Interview Results
      interviewResults: [
        {
          department: String,
          score: Number,
          totalQuestions: Number,
          percentage: Number,
          status: {
            type: String,
            enum: ['passed', 'failed'],
          },
          takenAt: Date,
          answers: [
            {
              questionId: mongoose.Schema.Types.ObjectId,
              answer: String,
              isCorrect: Boolean,
              points: Number,
            },
          ],
        },
      ],

      // Training Progress
      trainingProgress: [
        {
          courseId: mongoose.Schema.Types.ObjectId,
          progress: {
            type: Number,
            default: 0,
          },
          completed: {
            type: Boolean,
            default: false,
          },
          startedAt: Date,
          completedAt: Date,
        },
      ],

      // Profile Visibility
      isProfilePublic: {
        type: Boolean,
        default: true,
      },

      // Profile Completion Percentage
      profileCompletion: {
        type: Number,
        default: 0,
      },
    },

    // ========== EMPLOYER SPECIFIC FIELDS ==========
    employerProfile: {
      // Company Info
      companyName: {
        type: String,
        trim: true,
      },
      companyType: {
        type: String,
        enum: [
          'hotel',
          'restaurant',
          'resort',
          'catering',
          'event_venue',
          'spa',
          'travel_agency',
          'consulting',
          'other',
        ],
      },
      companySize: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
      },
      companyWebsite: String,
      companyEmail: String,
      companyPhone: String,

      // Company Logo
      companyLogo: {
        url: String,
        publicId: String,
      },

      // Company Description
      companyDescription: {
        type: String,
        maxlength: 5000,
      },

      // Industry
      industry: String,

      // Year Established
      yearEstablished: Number,

      // Registration Number
      registrationNumber: String,

      // Tax ID
      taxId: String,

      // Social Media
      socialMedia: {
        linkedin: String,
        facebook: String,
        instagram: String,
        twitter: String,
      },

      // Verification Status
      isVerified: {
        type: Boolean,
        default: false,
      },

      // Posted Jobs Count
      jobsPosted: {
        type: Number,
        default: 0,
      },

      // Active Jobs Count
      activeJobs: {
        type: Number,
        default: 0,
      },
    },

    // ========== CONSULTATION CLIENT FIELDS ==========
    consultationProfile: {
      businessName: String,
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
      propertyDescription: String,
      consultationHistory: [
        {
          consultationId: mongoose.Schema.Types.ObjectId,
          type: {
            type: String,
            enum: ['online', 'physical'],
          },
          status: String,
          date: Date,
        },
      ],
    },

    // ========== ADMIN FIELDS ==========
    adminProfile: {
      permissions: [
        {
          type: String,
          enum: [
            'users_manage',
            'jobs_manage',
            'resources_manage',
            'payments_manage',
            'consultations_manage',
            'community_manage',
            'analytics_view',
            'settings_manage',
          ],
        },
      ],
      department: String,
      employeeId: String,
    },

    // Notifications
    notifications: [
      {
        type: {
          type: String,
          enum: [
            'job_application',
            'interview_request',
            'message',
            'subscription',
            'certification',
            'system',
          ],
        },
        title: String,
        message: String,
        isRead: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        link: String,
      },
    ],

    // Saved Items
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],

    savedCandidates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for faster queries
userSchema.index({ role: 1 });
userSchema.index({ 'subscription.plan': 1 });
userSchema.index({ 'jobSeekerProfile.certificationStatus': 1 });
userSchema.index({ 'jobSeekerProfile.preferredDepartments': 1 });
userSchema.index({ 'employerProfile.companyName': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for jobs applied (for job seekers)
userSchema.virtual('jobsApplied', {
  ref: 'JobApplication',
  localField: '_id',
  foreignField: 'jobSeeker',
});

// Virtual for jobs posted (for employers)
userSchema.virtual('postedJobs', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'employer',
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate profile completion for job seekers
userSchema.methods.calculateProfileCompletion = function () {
  if (this.role !== 'jobseeker') return 0;

  const profile = this.jobSeekerProfile;
  let completedFields = 0;
  let totalFields = 10;

  if (profile.professionalTitle) completedFields++;
  if (profile.bio && profile.bio.length > 50) completedFields++;
  if (profile.skills && profile.skills.length > 0) completedFields++;
  if (profile.workExperience && profile.workExperience.length > 0) completedFields++;
  if (profile.education && profile.education.length > 0) completedFields++;
  if (profile.cv && profile.cv.url) completedFields++;
  if (profile.passportPhoto && profile.passportPhoto.url) completedFields++;
  if (profile.preferredDepartments && profile.preferredDepartments.length > 0) completedFields++;
  if (profile.languages && profile.languages.length > 0) completedFields++;
  if (profile.certifications && profile.certifications.length > 0) completedFields++;

  const completion = Math.round((completedFields / totalFields) * 100);
  this.jobSeekerProfile.profileCompletion = completion;
  return completion;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
