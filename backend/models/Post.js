const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    // Author
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Author Info (denormalized)
    authorName: String,
    authorPhoto: String,
    authorRole: String,

    // Post Content
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: 5000,
    },

    // Title (optional, for longer posts)
    title: String,

    // Post Type
    type: {
      type: String,
      enum: ['discussion', 'question', 'experience', 'advice', 'news', 'other'],
      default: 'discussion',
    },

    // Category
    category: {
      type: String,
      enum: [
        'general',
        'career_advice',
        'interview_tips',
        'industry_news',
        'job_search',
        'workplace',
        'training',
        'certification',
        'hospitality_trends',
        'success_stories',
        'help',
      ],
      default: 'general',
    },

    // Tags
    tags: [String],

    // Media Attachments
    media: [
      {
        type: {
          type: String,
          enum: ['image', 'video', 'document'],
        },
        url: String,
        publicId: String,
        thumbnail: String,
      },
    ],

    // Likes
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Comments
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        authorName: String,
        authorPhoto: String,
        content: {
          type: String,
          required: true,
          maxlength: 2000,
        },
        likes: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        replies: [
          {
            author: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
            },
            authorName: String,
            content: String,
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
        isEdited: {
          type: Boolean,
          default: false,
        },
        editedAt: Date,
      },
    ],

    // Views Count
    views: {
      type: Number,
      default: 0,
    },

    // Status
    status: {
      type: String,
      enum: ['active', 'hidden', 'reported', 'deleted'],
      default: 'active',
    },

    // Is Pinned
    isPinned: {
      type: Boolean,
      default: false,
    },

    // Is Featured
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Reports
    reports: [
      {
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: String,
        details: String,
        reportedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Last Activity
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
postSchema.index({ author: 1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ category: 1 });
postSchema.index({ type: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ isPinned: 1 });
postSchema.index({ lastActivity: -1 });
postSchema.index({ content: 'text', title: 'text' });

// Virtual for likes count
postSchema.virtual('likesCount').get(function () {
  return this.likes.length;
});

// Virtual for comments count
postSchema.virtual('commentsCount').get(function () {
  return this.comments.length;
});

// Pre-save middleware to update lastActivity
postSchema.pre('save', function (next) {
  if (this.isModified('comments') || this.isModified('likes')) {
    this.lastActivity = new Date();
  }
  next();
});

// Method to increment views
postSchema.methods.incrementViews = async function () {
  this.views += 1;
  await this.save();
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
