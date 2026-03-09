const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema(
  {
    // Question
    question: {
      type: String,
      required: [true, 'Question is required'],
    },

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
      ],
    },

    // Question Type
    type: {
      type: String,
      enum: ['multiple_choice', 'true_false', 'open_ended', 'scenario'],
      default: 'multiple_choice',
    },

    // Difficulty Level
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },

    // Options (for multiple choice)
    options: [
      {
        text: String,
        isCorrect: Boolean,
      },
    ],

    // Correct Answer (for true/false or text matching)
    correctAnswer: String,

    // Points
    points: {
      type: Number,
      default: 1,
    },

    // Explanation
    explanation: String,

    // Category/Topic
    category: String,

    // Tags
    tags: [String],

    // Time Limit (in seconds, 0 for no limit)
    timeLimit: {
      type: Number,
      default: 0,
    },

    // Is Active
    isActive: {
      type: Boolean,
      default: true,
    },

    // Created By
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Usage Count
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
interviewQuestionSchema.index({ department: 1 });
interviewQuestionSchema.index({ difficulty: 1 });
interviewQuestionSchema.index({ type: 1 });
interviewQuestionSchema.index({ isActive: 1 });
interviewQuestionSchema.index({ category: 1 });

const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);

module.exports = InterviewQuestion;
