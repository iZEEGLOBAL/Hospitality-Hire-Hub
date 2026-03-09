const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    // Course Title
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

    // Short Description
    shortDescription: String,

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
      required: true,
    },

    // Level
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },

    // Access Type
    accessType: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },

    // Thumbnail
    thumbnail: {
      url: String,
      publicId: String,
    },

    // Instructor
    instructor: {
      name: String,
      bio: String,
      photo: String,
    },

    // Modules/Lessons
    modules: [
      {
        title: String,
        description: String,
        order: Number,
        lessons: [
          {
            title: String,
            description: String,
            content: String,
            videoUrl: String,
            duration: Number, // in minutes
            resources: [
              {
                name: String,
                url: String,
                type: String,
              },
            ],
            isPreview: {
              type: Boolean,
              default: false,
            },
            order: Number,
          },
        ],
      },
    ],

    // Total Duration
    totalDuration: {
      type: Number,
      default: 0, // in minutes
    },

    // Total Lessons
    totalLessons: {
      type: Number,
      default: 0,
    },

    // Tags
    tags: [String],

    // Prerequisites
    prerequisites: [String],

    // Learning Outcomes
    learningOutcomes: [String],

    // Status
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
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

    // Enrollments Count
    enrollmentsCount: {
      type: Number,
      default: 0,
    },

    // Completions Count
    completionsCount: {
      type: Number,
      default: 0,
    },

    // Published Date
    publishedAt: Date,

    // Is Featured
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Certificate
    certificate: {
      isEnabled: {
        type: Boolean,
        default: true,
      },
      template: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
courseSchema.index({ status: 1, publishedAt: -1 });
courseSchema.index({ department: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ accessType: 1 });
courseSchema.index({ isFeatured: 1 });
courseSchema.index({ title: 'text', description: 'text' });

// Generate slug before saving
courseSchema.pre('save', function (next) {
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

  // Calculate total lessons and duration
  if (this.modules && this.modules.length > 0) {
    let totalLessons = 0;
    let totalDuration = 0;

    this.modules.forEach((module) => {
      if (module.lessons && module.lessons.length > 0) {
        totalLessons += module.lessons.length;
        module.lessons.forEach((lesson) => {
          totalDuration += lesson.duration || 0;
        });
      }
    });

    this.totalLessons = totalLessons;
    this.totalDuration = totalDuration;
  }

  next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
