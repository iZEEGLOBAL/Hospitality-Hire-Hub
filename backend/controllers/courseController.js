const Course = require('../models/Course');
const CourseEnrollment = require('../models/CourseEnrollment');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const {
      department,
      level,
      accessType,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const query = { status: 'published' };

    if (department) query.department = department;
    if (level) query.level = level;
    if (accessType) query.accessType = accessType;
    if (search) {
      query.$text = { $search: search };
    }

    const courses = await Course.find(query)
      .select('-modules -reviews')
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      count: courses.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message,
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('reviews.user', 'firstName lastName photo');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user has access
    let hasAccess = false;
    let isEnrolled = false;
    let enrollment = null;

    if (course.accessType === 'free') {
      hasAccess = true;
    }

    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user.subscription.plan !== 'free' && user.subscription.status === 'active') {
        hasAccess = true;
      }

      // Check enrollment
      enrollment = await CourseEnrollment.findOne({
        user: req.user.id,
        course: req.params.id,
      });

      isEnrolled = !!enrollment;
    }

    res.json({
      success: true,
      data: {
        ...course.toObject(),
        hasAccess,
        isEnrolled,
        enrollment,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message,
    });
  }
};

// @desc    Get course by slug
// @route   GET /api/courses/slug/:slug
// @access  Public
exports.getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({
      slug: req.params.slug,
      status: 'published',
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message,
    });
  }
};

// @desc    Get featured courses
// @route   GET /api/courses/featured
// @access  Public
exports.getFeaturedCourses = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const courses = await Course.find({
      status: 'published',
      isFeatured: true,
    })
      .select('title description thumbnail department level totalDuration totalLessons rating')
      .sort({ enrollmentsCount: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured courses',
      error: error.message,
    });
  }
};

// @desc    Get course categories
// @route   GET /api/courses/departments
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
      { value: 'general', label: 'General' },
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

// ==================== ADMIN ROUTES ====================

// @desc    Create course
// @route   POST /api/courses/admin
// @access  Private (Admin)
exports.createCourse = async (req, res) => {
  try {
    let courseData = { ...req.body };

    if (req.file) {
      courseData.thumbnail = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message,
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/admin/:id
// @access  Private (Admin)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const updateData = { ...req.body };

    if (req.file) {
      // Delete old thumbnail
      if (course.thumbnail?.publicId) {
        await cloudinary.uploader.destroy(course.thumbnail.publicId);
      }

      updateData.thumbnail = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message,
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/admin/:id
// @access  Private (Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Delete thumbnail from cloudinary
    if (course.thumbnail?.publicId) {
      await cloudinary.uploader.destroy(course.thumbnail.publicId);
    }

    await course.deleteOne();

    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message,
    });
  }
};

// @desc    Get all courses (admin)
// @route   GET /api/courses/admin
// @access  Private (Admin)
exports.getAllCourses = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      count: courses.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message,
    });
  }
};
