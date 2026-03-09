const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    // Question
    question: {
      type: String,
      required: [true, 'Question is required'],
    },

    // Answer
    answer: {
      type: String,
      required: [true, 'Answer is required'],
    },

    // Category
    category: {
      type: String,
      enum: [
        'general',
        'job_seekers',
        'employers',
        'subscription',
        'payment',
        'interview',
        'certification',
        'consultation',
        'technical',
      ],
      default: 'general',
    },

    // Display Order
    order: {
      type: Number,
      default: 0,
    },

    // Is Active
    isActive: {
      type: Boolean,
      default: true,
    },

    // Views Count
    views: {
      type: Number,
      default: 0,
    },

    // Helpful Count
    helpful: {
      type: Number,
      default: 0,
    },

    // Not Helpful Count
    notHelpful: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
faqSchema.index({ category: 1, isActive: 1 });
faqSchema.index({ order: 1 });

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;
