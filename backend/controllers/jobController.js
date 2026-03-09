const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Get all jobs (public)
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const {
      search,
      department,
      location,
      jobType,
      experienceLevel,
      minSalary,
      maxSalary,
      page = 1,
      limit = 10,
      sort = '-publishedAt',
    } = req.query;

    const query = { status: 'active' };

    // Search by keyword
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Filter by location
    if (location) {
      query.$or = [
        { 'location.country': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.city': { $regex: location, $options: 'i' } },
      ];
    }

    // Filter by job type
    if (jobType) {
      query.jobType = jobType;
    }

    // Filter by experience level
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Filter by salary range
    if (minSalary || maxSalary) {
      query['salary.min'] = {};
      if (minSalary) query['salary.min'].$gte = parseInt(minSalary);
      if (maxSalary) query['salary.max'] = { $lte: parseInt(maxSalary) };
    }

    // Execute query
    const jobs = await Job.find(query)
      .select('-__v')
      .sort(sort)
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

// @desc    Get single job (public)
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      status: 'active',
    }).populate('employer', 'employerProfile.companyName employerProfile.companyLogo');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Increment views
    await job.incrementViews();

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

// @desc    Get job by slug (public)
// @route   GET /api/jobs/slug/:slug
// @access  Public
exports.getJobBySlug = async (req, res) => {
  try {
    const job = await Job.findOne({
      slug: req.params.slug,
      status: 'active',
    }).populate('employer', 'employerProfile.companyName employerProfile.companyLogo employerProfile.companyDescription');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Increment views
    await job.incrementViews();

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

// @desc    Get featured jobs
// @route   GET /api/jobs/featured
// @access  Public
exports.getFeaturedJobs = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const jobs = await Job.find({
      status: 'active',
      isFeatured: true,
    })
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured jobs',
      error: error.message,
    });
  }
};

// @desc    Get recent jobs
// @route   GET /api/jobs/recent
// @access  Public
exports.getRecentJobs = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const jobs = await Job.find({ status: 'active' })
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent jobs',
      error: error.message,
    });
  }
};

// @desc    Get urgent jobs
// @route   GET /api/jobs/urgent
// @access  Public
exports.getUrgentJobs = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const jobs = await Job.find({
      status: 'active',
      isUrgent: true,
    })
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching urgent jobs',
      error: error.message,
    });
  }
};

// @desc    Get job statistics
// @route   GET /api/jobs/stats
// @access  Public
exports.getJobStats = async (req, res) => {
  try {
    const stats = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          byDepartment: {
            $push: '$department',
          },
          byJobType: {
            $push: '$jobType',
          },
        },
      },
    ]);

    const departmentCounts = {};
    const jobTypeCounts = {};

    if (stats.length > 0) {
      stats[0].byDepartment.forEach((dept) => {
        departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
      });

      stats[0].byJobType.forEach((type) => {
        jobTypeCounts[type] = (jobTypeCounts[type] || 0) + 1;
      });
    }

    res.json({
      success: true,
      data: {
        totalJobs: stats[0]?.totalJobs || 0,
        byDepartment: departmentCounts,
        byJobType: jobTypeCounts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching job statistics',
      error: error.message,
    });
  }
};

// @desc    Get related jobs
// @route   GET /api/jobs/:id/related
// @access  Public
exports.getRelatedJobs = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    const relatedJobs = await Job.find({
      _id: { $ne: req.params.id },
      status: 'active',
      $or: [
        { department: job.department },
        { jobType: job.jobType },
        { 'location.city': job.location.city },
      ],
    })
      .limit(5)
      .select('title companyName location department jobType salary slug');

    res.json({
      success: true,
      count: relatedJobs.length,
      data: relatedJobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching related jobs',
      error: error.message,
    });
  }
};

// @desc    Get job departments
// @route   GET /api/jobs/departments
// @access  Public
exports.getDepartments = async (req, res) => {
  try {
    const departments = [
      { value: 'front_office', label: 'Front Office' },
      { value: 'housekeeping', label: 'Housekeeping' },
      { value: 'kitchen', label: 'Kitchen' },
      { value: 'food_beverage', label: 'Food & Beverage' },
      { value: 'management', label: 'Management' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'security', label: 'Security' },
      { value: 'spa_wellness', label: 'Spa & Wellness' },
      { value: 'sales_marketing', label: 'Sales & Marketing' },
      { value: 'accounting', label: 'Accounting' },
      { value: 'human_resources', label: 'Human Resources' },
    ];

    res.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message,
    });
  }
};

// @desc    Get job types
// @route   GET /api/jobs/types
// @access  Public
exports.getJobTypes = async (req, res) => {
  try {
    const jobTypes = [
      { value: 'full_time', label: 'Full Time' },
      { value: 'part_time', label: 'Part Time' },
      { value: 'contract', label: 'Contract' },
      { value: 'temporary', label: 'Temporary' },
      { value: 'internship', label: 'Internship' },
    ];

    res.json({
      success: true,
      data: jobTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching job types',
      error: error.message,
    });
  }
};

// @desc    Get experience levels
// @route   GET /api/jobs/experience-levels
// @access  Public
exports.getExperienceLevels = async (req, res) => {
  try {
    const experienceLevels = [
      { value: 'entry', label: 'Entry Level (0-2 years)' },
      { value: 'mid', label: 'Mid Level (2-5 years)' },
      { value: 'senior', label: 'Senior Level (5-10 years)' },
      { value: 'executive', label: 'Executive (10+ years)' },
    ];

    res.json({
      success: true,
      data: experienceLevels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching experience levels',
      error: error.message,
    });
  }
};
