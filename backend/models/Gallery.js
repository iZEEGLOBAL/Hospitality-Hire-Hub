const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    // Title
    title: {
      type: String,
      required: [true, 'Title is required'],
    },

    // Description
    description: String,

    // Image
    image: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
    },

    // Category
    category: {
      type: String,
      enum: ['hotel', 'restaurant', 'seminar', 'training', 'event', 'other'],
      required: true,
    },

    // Location
    location: {
      country: String,
      state: String,
      city: String,
    },

    // Tags
    tags: [String],

    // Featured
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Display Order
    order: {
      type: Number,
      default: 0,
    },

    // Status
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },

    // Uploaded By
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Views
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
gallerySchema.index({ category: 1, status: 1 });
gallerySchema.index({ isFeatured: 1 });
gallerySchema.index({ order: 1 });

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;
