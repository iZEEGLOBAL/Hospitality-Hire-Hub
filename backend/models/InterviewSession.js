const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema(
  {
    // User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Department
    department: {
      type: String,
      required: true,
      enum: [
        'front_office',
        'housekeeping',
        'kitchen',
        'food_beverage',
        'management',
        'maintenance',
      ],
    },

    // Questions
    questions: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'InterviewQuestion',
        },
        question: String,
        options: [
          {
            text: String,
            isCorrect: Boolean,
          },
        ],
        type: String,
        correctAnswer: String,
        points: Number,
        userAnswer: String,
        isCorrect: Boolean,
        earnedPoints: Number,
        answeredAt: Date,
      },
    ],

    // Results
    results: {
      totalQuestions: Number,
      answeredQuestions: Number,
      correctAnswers: Number,
      totalPoints: Number,
      earnedPoints: Number,
      percentage: Number,
      grade: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'F'],
      },
      status: {
        type: String,
        enum: ['passed', 'failed'],
      },
    },

    // Timing
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    duration: Number, // in seconds

    // Status
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },

    // Attempt Number
    attemptNumber: {
      type: Number,
      default: 1,
    },

    // Certification Awarded
    certificationAwarded: {
      type: Boolean,
      default: false,
    },

    // Certificate Details
    certificate: {
      certificateId: String,
      issuedAt: Date,
      expiresAt: Date,
      downloadUrl: String,
    },

    // Recommended Resources (for failed attempts)
    recommendedResources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
      },
    ],

    // Feedback
    feedback: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
interviewSessionSchema.index({ user: 1, department: 1 });
interviewSessionSchema.index({ status: 1 });
interviewSessionSchema.index({ startedAt: -1 });

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

module.exports = InterviewSession;
