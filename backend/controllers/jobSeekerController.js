const User = require('../models/User');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const Resource = require('../models/Resource');
const Course = require('../models/Course');
const CourseEnrollment = require('../models/CourseEnrollment');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get job seeker profile
// @route   GET /api/jobseeker/profile
// @access  Private (Job Seeker)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: user.jobSeekerProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

// @desc    Update job seeker profile
// @route   PUT /api/jobseeker/profile
// @access  Private (Job Seeker)
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const allowedFields = [
      'professionalTitle',
      'yearsOfExperience',
      'currentSalary',
      'expectedSalary',
      'currency',
      'bio',
      'skills',
      'languages',
      'preferredDepartments',
      'workExperience',
      'education',
      'certifications',
      'availability',
      'willingToRelocate',
      'isProfilePublic',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user.jobSeekerProfile[field] = req.body[field];
      }
    });

    // Calculate profile completion
    user.calculateProfileCompletion();

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user.jobSeekerProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

// @desc    Upload CV
// @route   POST /api/jobseeker/cv
// @access  Private (Job Seeker)
exports.uploadCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    const user = await User.findById(req.user.id);

    // Delete old CV if exists
    if (user.jobSeekerProfile.cv?.publicId) {
      await cloudinary.uploader.destroy(user.jobSeekerProfile.cv.publicId);
    }

    user.jobSeekerProfile.cv = {
      url: req.file.path,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      uploadDate: new Date(),
    };

    // Update profile completion
    user.calculateProfileCompletion();

    await user.save();

    res.json({
      success: true,
      message: 'CV uploaded successfully',
      data: user.jobSeekerProfile.cv,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading CV',
      error: error.message,
    });
  }
};

// @desc    Upload passport photo
// @route   POST /api/jobseeker/photo
// @access  Private (Job Seeker)
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a photo',
      });
    }

    const user = await User.findById(req.user.id);

    // Delete old photo if exists
    if (user.jobSeekerProfile.passportPhoto?.publicId) {
      await cloudinary.uploader.destroy(user.jobSeekerProfile.passportPhoto.publicId);
    }

    user.jobSeekerProfile.passportPhoto = {
      url: req.file.path,
      publicId: req.file.filename,
    };

    // Also update main profile photo
    user.photo = {
      url: req.file.path,
      publicId: req.file.filename,
    };

    // Update profile completion
    user.calculateProfileCompletion();

    await user.save();

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: user.jobSeekerProfile.passportPhoto,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading photo',
      error: error.message,
    });
  }
};

// @desc    Upload certificate
// @route   POST /api/jobseeker/certificates
// @access  Private (Job Seeker)
exports.uploadCertificate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a certificate',
      });
    }

    const { name, issuingOrganization, issueDate, expiryDate, credentialId } = req.body;

    const user = await User.findById(req.user.id);

    user.jobSeekerProfile.certifications.push({
      name,
      issuingOrganization,
      issueDate,
      expiryDate,
      credentialId,
      documentUrl: req.file.path,
      documentPublicId: req.file.filename,
    });

    // Update profile completion
    user.calculateProfileCompletion();

    await user.save();

    res.json({
      success: true,
      message: 'Certificate uploaded successfully',
      data: user.jobSeekerProfile.certifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading certificate',
      error: error.message,
    });
  }
};

// @desc    Delete certificate
// @route   DELETE /api/jobseeker/certificates/:index
// @access  Private (Job Seeker)
exports.deleteCertificate = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const index = parseInt(req.params.index);

    if (index < 0 || index >= user.jobSeekerProfile.certifications.length) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    const cert = user.jobSeekerProfile.certifications[index];

    // Delete from cloudinary
    if (cert.documentPublicId) {
      await cloudinary.uploader.destroy(cert.documentPublicId);
    }

    user.jobSeekerProfile.certifications.splice(index, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Certificate deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting certificate',
      error: error.message,
    });
  }
};

// @desc    Get applied jobs
// @route   GET /api/jobseeker/applications
// @access  Private (Job Seeker)
exports.getApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ jobSeeker: req.user.id })
      .populate('job', 'title companyName location department jobType')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message,
    });
  }
};

// @desc    Apply for job
// @route   POST /api/jobseeker/apply/:jobId
// @access  Private (Job Seeker)
exports.applyForJob = async (req, res) => {
  try {
    const { coverLetter, expectedSalary, availability } = req.body;

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications',
      });
    }

    // Check if already applied
    const existingApplication = await JobApplication.findOne({
      job: req.params.jobId,
      jobSeeker: req.user.id,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job',
      });
    }

    const application = await JobApplication.create({
      job: req.params.jobId,
      jobSeeker: req.user.id,
      employer: job.employer,
      coverLetter,
      expectedSalary,
      availability,
    });

    // Update job applications count
    job.applicationsCount += 1;
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message,
    });
  }
};

// @desc    Withdraw application
// @route   PUT /api/jobseeker/applications/:id/withdraw
// @access  Private (Job Seeker)
exports.withdrawApplication = async (req, res) => {
  try {
    const { reason } = req.body;

    const application = await JobApplication.findOne({
      _id: req.params.id,
      jobSeeker: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.status === 'withdrawn') {
      return res.status(400).json({
        success: false,
        message: 'Application already withdrawn',
      });
    }

    application.status = 'withdrawn';
    application.withdrawnReason = reason;
    await application.save();

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error withdrawing application',
      error: error.message,
    });
  }
};

// @desc    Get saved jobs
// @route   GET /api/jobseeker/saved-jobs
// @access  Private (Job Seeker)
exports.getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedJobs',
      select: 'title companyName location department jobType salary status',
      match: { status: 'active' },
    });

    res.json({
      success: true,
      count: user.savedJobs.length,
      data: user.savedJobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching saved jobs',
      error: error.message,
    });
  }
};

// @desc    Save job
// @route   POST /api/jobseeker/save-job/:jobId
// @access  Private (Job Seeker)
exports.saveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.savedJobs.includes(req.params.jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Job already saved',
      });
    }

    user.savedJobs.push(req.params.jobId);
    await user.save();

    res.json({
      success: true,
      message: 'Job saved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving job',
      error: error.message,
    });
  }
};

// @desc    Unsave job
// @route   DELETE /api/jobseeker/save-job/:jobId
// @access  Private (Job Seeker)
exports.unsaveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.savedJobs = user.savedJobs.filter(
      (jobId) => jobId.toString() !== req.params.jobId
    );
    await user.save();

    res.json({
      success: true,
      message: 'Job removed from saved jobs',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing saved job',
      error: error.message,
    });
  }
};

// @desc    Get enrolled courses
// @route   GET /api/jobseeker/courses
// @access  Private (Job Seeker)
exports.getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await CourseEnrollment.find({ user: req.user.id })
      .populate('course', 'title description thumbnail totalDuration totalLessons')
      .sort({ enrolledAt: -1 });

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message,
    });
  }
};

// @desc    Enroll in course
// @route   POST /api/jobseeker/enroll/:courseId
// @access  Private (Job Seeker)
exports.enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Course is not available',
      });
    }

    // Check if already enrolled
    const existingEnrollment = await CourseEnrollment.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course',
      });
    }

    // Check if premium course
    if (course.accessType === 'premium') {
      const user = await User.findById(req.user.id);
      if (user.subscription.plan === 'free') {
        return res.status(403).json({
          success: false,
          message: 'This course requires a premium subscription',
        });
      }
    }

    const enrollment = await CourseEnrollment.create({
      user: req.user.id,
      course: req.params.courseId,
    });

    // Update course enrollments count
    course.enrollmentsCount += 1;
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error enrolling in course',
      error: error.message,
    });
  }
};

// @desc    Update course progress
// @route   PUT /api/jobseeker/course-progress/:enrollmentId
// @access  Private (Job Seeker)
exports.updateCourseProgress = async (req, res) => {
  try {
    const { moduleId, lessonId } = req.body;

    const enrollment = await CourseEnrollment.findOne({
      _id: req.params.enrollmentId,
      user: req.user.id,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    // Check if lesson already completed
    const alreadyCompleted = enrollment.progress.completedLessons.some(
      (lesson) =>
        lesson.moduleId.toString() === moduleId &&
        lesson.lessonId.toString() === lessonId
    );

    if (!alreadyCompleted) {
      enrollment.progress.completedLessons.push({
        moduleId,
        lessonId,
        completedAt: new Date(),
      });

      // Calculate percentage
      const course = await Course.findById(enrollment.course);
      const percentage = Math.round(
        (enrollment.progress.completedLessons.length / course.totalLessons) * 100
      );
      enrollment.progress.percentage = percentage;
      enrollment.progress.lastAccessedLesson = { moduleId, lessonId };

      // Check if course completed
      if (percentage >= 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
        course.completionsCount += 1;
        await course.save();
      } else if (enrollment.status === 'enrolled') {
        enrollment.status = 'in_progress';
      }

      await enrollment.save();
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating progress',
      error: error.message,
    });
  }
};

// @desc    Get free resources
// @route   GET /api/jobseeker/resources/free
// @access  Private (Job Seeker)
exports.getFreeResources = async (req, res) => {
  try {
    const resources = await Resource.find({
      accessType: 'free',
      status: 'published',
    })
      .select('title description type category thumbnail downloadCount')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching resources',
      error: error.message,
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/jobseeker/dashboard
// @access  Private (Job Seeker)
exports.getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const applicationsCount = await JobApplication.countDocuments({
      jobSeeker: req.user.id,
    });
    const interviewsCount = await JobApplication.countDocuments({
      jobSeeker: req.user.id,
      status: { $in: ['interview_scheduled', 'interviewed'] },
    });
    const coursesCount = await CourseEnrollment.countDocuments({
      user: req.user.id,
    });

    res.json({
      success: true,
      data: {
        profileCompletion: user.jobSeekerProfile.profileCompletion,
        certificationStatus: user.jobSeekerProfile.certificationStatus,
        applicationsCount,
        interviewsCount,
        savedJobsCount: user.savedJobs.length,
        coursesCount,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message,
    });
  }
};
