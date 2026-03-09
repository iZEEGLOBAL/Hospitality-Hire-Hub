const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    // Resource Title
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },

    // Slug
    slug: {
      type: String,
      unique: true,
    },

    // Description
    description: {
      type: String,
      required: [true, 'Description is required'],
    },

    // Resource Type
    type: {
      type: String,
      enum: [
        'sop',
        'job_description',
        'training_manual',
        'checklist',
        'template',
        'guide',
        'video',
        'presentation',
        'document',
        'other',
      ],
      required: true,
    },

    // Category
    category: {
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
        'general',
        'interview_prep',
        'career_development',
      ],
      required: true,
    },

    // Access Type
    accessType: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },

    // File Information
    file: {
      url: {
        type: String,
        required: true,
      },
      publicId: String,
      originalName: String,
      fileType: String,
      fileSize: Number,
    },

    // Thumbnail (for videos and presentations)
    thumbnail: {
      url: String,
      publicId: String,
    },

    // Preview Content (for premium resources)
    previewContent: String,

    // Author/Creator
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Author Name (for display)
    authorName: String,

    // Tags
    tags: [String],

    // Department
    department: {
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
        'general',
      ],
    },

    // Difficulty Level
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },

    // Estimated Reading/Viewing Time (in minutes)
    estimatedTime: Number,

    // Status
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },

    // Download Count
    downloadCount: {
      type: Number,
      default: 0,
    },

    // View Count
    viewCount: {
      type: Number,
      default: 0,
    },

    // Rating
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    // Reviews
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Published Date
    publishedAt: Date,

    // Language
    language: {
      type: String,
      default: 'en',
    },

    // Version
    version: {
      type: String,
      default: '1.0',
    },

    // Is Featured
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
resourceSchema.index({ status: 1, publishedAt: -1 });
resourceSchema.index({ type: 1 });
resourceSchema.index({ category: 1 });
resourceSchema.index({ accessType: 1 });
resourceSchema.index({ department: 1 });
resourceSchema.index({ difficultyLevel: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ title: 'text', description: 'text' });

// Generate slug before saving
resourceSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36);
  }

  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Method to increment download count
resourceSchema.methods.incrementDownloads = async function () {
  this.downloadCount += 1;
  await this.save();
};

// Method to increment view count
resourceSchema.methods.incrementViews = async function () {
  this.viewCount += 1;
  await this.save();
};

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
