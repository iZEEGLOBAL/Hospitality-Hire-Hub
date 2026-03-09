const mongoose = require('mongoose');

const courseEnrollmentSchema = new mongoose.Schema(
  {
    // User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Course
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },

    // Enrollment Date
    enrolledAt: {
      type: Date,
      default: Date.now,
    },

    // Progress
    progress: {
      completedLessons: [
        {
          moduleId: mongoose.Schema.Types.ObjectId,
          lessonId: mongoose.Schema.Types.ObjectId,
          completedAt: Date,
        },
      ],
      percentage: {
        type: Number,
        default: 0,
      },
      lastAccessedLesson: {
        moduleId: mongoose.Schema.Types.ObjectId,
        lessonId: mongoose.Schema.Types.ObjectId,
      },
    },

    // Status
    status: {
      type: String,
      enum: ['enrolled', 'in_progress', 'completed', 'dropped'],
      default: 'enrolled',
    },

    // Completed At
    completedAt: Date,

    // Certificate
    certificate: {
      issued: {
        type: Boolean,
        default: false,
      },
      certificateId: String,
      issuedAt: Date,
      downloadUrl: String,
    },

    // Notes
    notes: String,

    // Rating Given
    ratingGiven: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate enrollments
courseEnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
courseEnrollmentSchema.index({ user: 1, status: 1 });
courseEnrollmentSchema.index({ course: 1, status: 1 });

const CourseEnrollment = mongoose.model('CourseEnrollment', courseEnrollmentSchema);

module.exports = CourseEnrollment;
