const User = require('../models/User');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get employer profile
// @route   GET /api/employer/profile
// @access  Private (Employer)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: user.employerProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

// @desc    Update employer profile
// @route   PUT /api/employer/profile
// @access  Private (Employer)
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const allowedFields = [
      'companyName',
      'companyType',
      'companySize',
      'companyWebsite',
      'companyEmail',
      'companyPhone',
      'companyDescription',
      'industry',
      'yearEstablished',
      'registrationNumber',
      'taxId',
      'socialMedia',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user.employerProfile[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user.employerProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

// @desc    Upload company logo
// @route   POST /api/employer/logo
// @access  Private (Employer)
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a logo',
      });
    }

    const user = await User.findById(req.user.id);

    // Delete old logo if exists
    if (user.employerProfile.companyLogo?.publicId) {
      await cloudinary.uploader.destroy(user.employerProfile.companyLogo.publicId);
    }

    user.employerProfile.companyLogo = {
      url: req.file.path,
      publicId: req.file.filename,
    };

    await user.save();

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: user.employerProfile.companyLogo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading logo',
      error: error.message,
    });
  }
};

// @desc    Create job
// @route   POST /api/employer/jobs
// @access  Private (Employer)
exports.createJob = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Check subscription
    if (user.subscription.plan === 'free') {
      return res.status(403).json({
        success: false,
        message: 'Please upgrade your subscription to post jobs',
      });
    }

    // Check active jobs limit based on plan
    const activeJobsCount = await Job.countDocuments({
      employer: req.user.id,
      status: 'active',
    });

    const jobLimits = {
      pro: 3,
      business: 20,
    };

    if (activeJobsCount >= jobLimits[user.subscription.plan]) {
      return res.status(403).json({
        success: false,
        message: `You have reached the maximum number of active jobs for your ${user.subscription.plan} plan`,
      });
    }

    const jobData = {
      ...req.body,
      employer: req.user.id,
      companyName: user.employerProfile.companyName,
      companyLogo: user.employerProfile.companyLogo?.url,
    };

    const job = await Job.create(jobData);

    // Update employer stats
    user.employerProfile.jobsPosted += 1;
    user.employerProfile.activeJobs += 1;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating job',
      error: error.message,
    });
  }
};

// @desc    Get employer jobs
// @route   GET /api/employer/jobs
// @access  Private (Employer)
exports.getJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { employer: req.user.id };
    if (status) query.status = status;

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      count: jobs.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message,
    });
  }
};

// @desc    Get single job
// @route   GET /api/employer/jobs/:id
// @access  Private (Employer)
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      employer: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message,
    });
  }
};

// @desc    Update job
// @route   PUT /api/employer/jobs/:id
// @access  Private (Employer)
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findOne({
      _id: req.params.id,
      employer: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Prevent updating closed jobs
    if (job.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update closed job',
      });
    }

    job = await Job.findOneAndUpdate(
      { _id: req.params.id, employer: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: error.message,
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/employer/jobs/:id
// @access  Private (Employer)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      employer: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Update employer stats if job was active
    if (job.status === 'active') {
      const user = await User.findById(req.user.id);
      user.employerProfile.activeJobs = Math.max(
        0,
        user.employerProfile.activeJobs - 1
      );
      await user.save();
    }

    await job.deleteOne();

    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message,
    });
  }
};

// @desc    Close job
// @route   PUT /api/employer/jobs/:id/close
// @access  Private (Employer)
exports.closeJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      employer: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Job is already closed',
      });
    }

    job.status = 'closed';
    job.closedAt = new Date();
    await job.save();

    // Update employer stats
    const user = await User.findById(req.user.id);
    user.employerProfile.activeJobs = Math.max(
      0,
      user.employerProfile.activeJobs - 1
    );
    await user.save();

    res.json({
      success: true,
      message: 'Job closed successfully',
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error closing job',
      error: error.message,
    });
  }
};

// @desc    Get job applications
// @route   GET /api/employer/jobs/:id/applications
// @access  Private (Employer)
exports.getApplications = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      employer: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const query = { job: req.params.id };
    if (status) query.status = status;

    const applications = await JobApplication.find(query)
      .populate({
        path: 'jobSeeker',
        select: 'firstName lastName email phone photo jobSeekerProfile',
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await JobApplication.countDocuments(query);

    res.json({
      success: true,
      count: applications.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
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

// @desc    Update application status
// @route   PUT /api/employer/applications/:id/status
// @access  Private (Employer)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes, rejectionReason } = req.body;

    const application = await JobApplication.findOne({
      _id: req.params.id,
      employer: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    application.status = status;
    if (notes) application.employerNotes = notes;
    if (rejectionReason) application.rejectionReason = rejectionReason;

    // Mark as viewed
    if (!application.isViewed) {
      application.isViewed = true;
      application.viewedAt = new Date();
    }

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message,
    });
  }
};

// @desc    Schedule interview
// @route   PUT /api/employer/applications/:id/schedule-interview
// @access  Private (Employer)
exports.scheduleInterview = async (req, res) => {
  try {
    const {
      scheduledAt,
      type,
      location,
      meetingLink,
      notes,
      interviewerName,
      interviewerEmail,
      interviewerPhone,
    } = req.body;

    const application = await JobApplication.findOne({
      _id: req.params.id,
      employer: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    application.status = 'interview_scheduled';
    application.interview = {
      scheduledAt,
      type,
      location,
      meetingLink,
      notes,
      interviewerName,
      interviewerEmail,
      interviewerPhone,
    };

    await application.save();

    res.json({
      success: true,
      message: 'Interview scheduled successfully',
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error scheduling interview',
      error: error.message,
    });
  }
};

// @desc    Search certified candidates
// @route   GET /api/employer/candidates
// @access  Private (Employer)
exports.searchCandidates = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Check subscription
    if (user.subscription.plan === 'free') {
      return res.status(403).json({
        success: false,
        message: 'Please upgrade your subscription to search candidates',
      });
    }

    const {
      department,
      experience,
      location,
      skills,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {
      role: 'jobseeker',
      'jobSeekerProfile.certificationStatus': 'passed',
      'jobSeekerProfile.isProfilePublic': true,
    };

    if (department) {
      query['jobSeekerProfile.preferredDepartments'] = department;
    }

    if (experience) {
      const expRanges = {
        '0-2': { $lte: 2 },
        '2-5': { $gte: 2, $lte: 5 },
        '5-10': { $gte: 5, $lte: 10 },
        '10+': { $gte: 10 },
      };
      if (expRanges[experience]) {
        query['jobSeekerProfile.yearsOfExperience'] = expRanges[experience];
      }
    }

    if (location) {
      query.$or = [
        { country: { $regex: location, $options: 'i' } },
        { state: { $regex: location, $options: 'i' } },
        { city: { $regex: location, $options: 'i' } },
      ];
    }

    if (skills) {
      const skillsArray = skills.split(',').map((s) => s.trim());
      query['jobSeekerProfile.skills'] = { $in: skillsArray };
    }

    const candidates = await User.find(query)
      .select('firstName lastName photo country state city jobSeekerProfile')
      .sort({ 'jobSeekerProfile.profileCompletion': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: candidates.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: candidates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching candidates',
      error: error.message,
    });
  }
};

// @desc    Get candidate details
// @route   GET /api/employer/candidates/:id
// @access  Private (Employer)
exports.getCandidate = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Check subscription
    if (user.subscription.plan === 'free') {
      return res.status(403).json({
        success: false,
        message: 'Please upgrade your subscription to view candidate details',
      });
    }

    const candidate = await User.findOne({
      _id: req.params.id,
      role: 'jobseeker',
      'jobSeekerProfile.isProfilePublic': true,
    }).select('-password -notifications -savedJobs -savedCandidates');

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found',
      });
    }

    res.json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching candidate',
      error: error.message,
    });
  }
};

// @desc    Send interview request to candidate
// @route   POST /api/employer/candidates/:id/interview-request
// @access  Private (Employer)
exports.sendInterviewRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Check subscription
    if (user.subscription.plan === 'free') {
      return res.status(403).json({
        success: false,
        message: 'Please upgrade your subscription to contact candidates',
      });
    }

    const { message, jobId } = req.body;

    const candidate = await User.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found',
      });
    }

    // Add notification to candidate
    candidate.notifications.push({
      type: 'interview_request',
      title: 'Interview Request',
      message: `${user.employerProfile.companyName} has sent you an interview request: ${message}`,
      link: jobId ? `/jobs/${jobId}` : null,
    });

    await candidate.save();

    res.json({
      success: true,
      message: 'Interview request sent successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending interview request',
      error: error.message,
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/employer/dashboard
// @access  Private (Employer)
exports.getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const activeJobs = await Job.countDocuments({
      employer: req.user.id,
      status: 'active',
    });
    const totalApplications = await JobApplication.countDocuments({
      employer: req.user.id,
    });
    const pendingApplications = await JobApplication.countDocuments({
      employer: req.user.id,
      status: 'pending',
    });
    const interviewsScheduled = await JobApplication.countDocuments({
      employer: req.user.id,
      status: 'interview_scheduled',
    });

    res.json({
      success: true,
      data: {
        activeJobs,
        totalJobsPosted: user.employerProfile.jobsPosted,
        totalApplications,
        pendingApplications,
        interviewsScheduled,
        subscription: user.subscription,
        companyName: user.employerProfile.companyName,
        isVerified: user.employerProfile.isVerified,
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
