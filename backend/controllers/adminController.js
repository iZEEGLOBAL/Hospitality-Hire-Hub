const User = require('../models/User');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const Payment = require('../models/Payment');
const Post = require('../models/Post');
const Consultation = require('../models/Consultation');
const Resource = require('../models/Resource');
const InterviewSession = require('../models/InterviewSession');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const jobSeekers = await User.countDocuments({ role: 'jobseeker' });
    const employers = await User.countDocuments({ role: 'employer' });
    const consultationClients = await User.countDocuments({
      role: 'consultation_client',
    });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    // Job statistics
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const jobsThisMonth = await Job.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    // Application statistics
    const totalApplications = await JobApplication.countDocuments();
    const pendingApplications = await JobApplication.countDocuments({
      status: 'pending',
    });
    const applicationsThisMonth = await JobApplication.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    // Payment statistics
    const totalPayments = await Payment.countDocuments({ status: 'completed' });
    const paymentsThisMonth = await Payment.countDocuments({
      status: 'completed',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    // Calculate revenue
    const revenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const revenueThisMonth = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Consultation statistics
    const totalConsultations = await Consultation.countDocuments();
    const pendingConsultations = await Consultation.countDocuments({
      status: 'pending',
    });

    // Community statistics
    const totalPosts = await Post.countDocuments();
    const reportedPosts = await Post.countDocuments({ status: 'reported' });

    // Certification statistics
    const certifiedCandidates = await User.countDocuments({
      'jobSeekerProfile.certificationStatus': 'passed',
    });
    const totalInterviews = await InterviewSession.countDocuments();

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          jobSeekers,
          employers,
          consultationClients,
          newThisMonth: newUsersThisMonth,
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          thisMonth: jobsThisMonth,
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          thisMonth: applicationsThisMonth,
        },
        payments: {
          total: totalPayments,
          thisMonth: paymentsThisMonth,
          revenue: revenue[0]?.total || 0,
          revenueThisMonth: revenueThisMonth[0]?.total || 0,
        },
        consultations: {
          total: totalConsultations,
          pending: pendingConsultations,
        },
        community: {
          totalPosts,
          reportedPosts,
        },
        certifications: {
          certifiedCandidates,
          totalInterviews,
        },
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

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
};

// @desc    Deactivate/Activate user
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

// @desc    Get all jobs (admin)
// @route   GET /api/admin/jobs
// @access  Private (Admin)
exports.getJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const jobs = await Job.find(query)
      .populate('employer', 'firstName lastName email employerProfile.companyName')
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

// @desc    Update job status
// @route   PUT /api/admin/jobs/:id/status
// @access  Private (Admin)
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    job.status = status;
    await job.save();

    res.json({
      success: true,
      message: 'Job status updated successfully',
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating job status',
      error: error.message,
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
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

// @desc    Get analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // User growth
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Revenue by day
    const revenueByDay = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Jobs by department
    const jobsByDepartment = await Job.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
    ]);

    // Applications by status
    const applicationsByStatus = await JobApplication.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Subscription distribution
    const subscriptionDistribution = await User.aggregate([
      {
        $group: {
          _id: '$subscription.plan',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        userGrowth,
        revenueByDay,
        jobsByDepartment,
        applicationsByStatus,
        subscriptionDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message,
    });
  }
};

// @desc    Get recent activities
// @route   GET /api/admin/activities
// @access  Private (Admin)
exports.getRecentActivities = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get recent users
    const recentUsers = await User.find()
      .select('firstName lastName role createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Get recent jobs
    const recentJobs = await Job.find()
      .select('title employer status createdAt')
      .populate('employer', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Get recent payments
    const recentPayments = await Payment.find({ status: 'completed' })
      .select('userName amount currency createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Get recent applications
    const recentApplications = await JobApplication.find()
      .select('jobSeeker job status createdAt')
      .populate('jobSeeker', 'firstName lastName')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Combine and sort activities
    const activities = [
      ...recentUsers.map((u) => ({
        type: 'user_registered',
        description: `${u.firstName} ${u.lastName} registered as ${u.role}`,
        date: u.createdAt,
      })),
      ...recentJobs.map((j) => ({
        type: 'job_posted',
        description: `New job posted: ${j.title}`,
        date: j.createdAt,
      })),
      ...recentPayments.map((p) => ({
        type: 'payment_received',
        description: `Payment of ${p.currency} ${p.amount} received from ${p.userName}`,
        date: p.createdAt,
      })),
      ...recentApplications.map((a) => ({
        type: 'application_submitted',
        description: `New application submitted for ${a.job?.title}`,
        date: a.createdAt,
      })),
    ]
      .sort((a, b) => b.date - a.date)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activities',
      error: error.message,
    });
  }
};

// @desc    Approve employer
// @route   PUT /api/admin/employers/:id/approve
// @access  Private (Admin)
exports.approveEmployer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'employer') {
      return res.status(400).json({
        success: false,
        message: 'User is not an employer',
      });
    }

    user.employerProfile.isVerified = true;
    await user.save();

    res.json({
      success: true,
      message: 'Employer approved successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving employer',
      error: error.message,
    });
  }
};

// @desc    Get certified candidates
// @route   GET /api/admin/certified-candidates
// @access  Private (Admin)
exports.getCertifiedCandidates = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const candidates = await User.find({
      role: 'jobseeker',
      'jobSeekerProfile.certificationStatus': 'passed',
    })
      .select('firstName lastName email phone jobSeekerProfile interviewResults')
      .sort({ 'jobSeekerProfile.profileCompletion': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments({
      role: 'jobseeker',
      'jobSeekerProfile.certificationStatus': 'passed',
    });

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
      message: 'Error fetching certified candidates',
      error: error.message,
    });
  }
};
