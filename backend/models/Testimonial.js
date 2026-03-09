const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    // Name
    name: {
      type: String,
      required: [true, 'Name is required'],
    },

    // Role/Position
    role: {
      type: String,
      required: [true, 'Role is required'],
    },

    // Company
    company: String,

    // Photo
    photo: {
      url: String,
      publicId: String,
    },

    // Testimonial Content
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: 2000,
    },

    // Rating
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },

    // Category
    category: {
      type: String,
      enum: ['job_seeker', 'employer', 'consultation_client', 'general'],
      required: true,
    },

    // User (if registered user)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

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
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    // Approved By
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Approved At
    approvedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
testimonialSchema.index({ status: 1, isFeatured: 1 });
testimonialSchema.index({ category: 1 });
testimonialSchema.index({ rating: -1 });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;
