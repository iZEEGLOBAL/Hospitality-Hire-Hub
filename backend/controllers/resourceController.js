const Resource = require('../models/Resource');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
exports.getResources = async (req, res) => {
  try {
    const {
      type,
      category,
      department,
      accessType,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const query = { status: 'published' };

    if (type) query.type = type;
    if (category) query.category = category;
    if (department) query.department = department;
    if (accessType) query.accessType = accessType;
    if (search) {
      query.$text = { $search: search };
    }

    const resources = await Resource.find(query)
      .select('-file.publicId -reviews')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Resource.countDocuments(query);

    res.json({
      success: true,
      count: resources.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
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

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Increment views
    await resource.incrementViews();

    // Check if premium and user has access
    let hasAccess = false;
    if (resource.accessType === 'free') {
      hasAccess = true;
    } else if (req.user) {
      const user = await User.findById(req.user.id);
      hasAccess = user.subscription.plan !== 'free' && user.subscription.status === 'active';
    }

    res.json({
      success: true,
      data: {
        ...resource.toObject(),
        hasAccess,
        file: hasAccess ? resource.file : undefined,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching resource',
      error: error.message,
    });
  }
};

// @desc    Download resource
// @route   GET /api/resources/:id/download
// @access  Private
exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Check access for premium resources
    if (resource.accessType === 'premium') {
      const user = await User.findById(req.user.id);
      if (user.subscription.plan === 'free' || user.subscription.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'This resource requires a premium subscription',
        });
      }
    }

    // Increment download count
    await resource.incrementDownloads();

    res.json({
      success: true,
      data: {
        downloadUrl: resource.file.url,
        fileName: resource.file.originalName || resource.title,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error downloading resource',
      error: error.message,
    });
  }
};

// @desc    Get featured resources
// @route   GET /api/resources/featured
// @access  Public
exports.getFeaturedResources = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const resources = await Resource.find({
      status: 'published',
      isFeatured: true,
    })
      .select('title description type category thumbnail accessType downloadCount')
      .sort({ downloadCount: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured resources',
      error: error.message,
    });
  }
};

// @desc    Get resources by category
// @route   GET /api/resources/category/:category
// @access  Public
exports.getResourcesByCategory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const resources = await Resource.find({
      category: req.params.category,
      status: 'published',
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Resource.countDocuments({
      category: req.params.category,
      status: 'published',
    });

    res.json({
      success: true,
      count: resources.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
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

// @desc    Get resource categories
// @route   GET /api/resources/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = [
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
      { value: 'interview_prep', label: 'Interview Preparation' },
      { value: 'career_development', label: 'Career Development' },
    ];

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message,
    });
  }
};

// @desc    Get resource types
// @route   GET /api/resources/types
// @access  Public
exports.getResourceTypes = async (req, res) => {
  try {
    const types = [
      { value: 'sop', label: 'Standard Operating Procedure' },
      { value: 'job_description', label: 'Job Description' },
      { value: 'training_manual', label: 'Training Manual' },
      { value: 'checklist', label: 'Checklist' },
      { value: 'template', label: 'Template' },
      { value: 'guide', label: 'Guide' },
      { value: 'video', label: 'Video' },
      { value: 'presentation', label: 'Presentation' },
      { value: 'document', label: 'Document' },
      { value: 'other', label: 'Other' },
    ];

    res.json({
      success: true,
      data: types,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching resource types',
      error: error.message,
    });
  }
};

// @desc    Add review
// @route   POST /api/resources/:id/reviews
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Check if user already reviewed
    const existingReview = resource.reviews.find(
      (r) => r.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this resource',
      });
    }

    resource.reviews.push({
      user: req.user.id,
      rating,
      comment,
    });

    // Calculate average rating
    const totalRating = resource.reviews.reduce((sum, r) => sum + r.rating, 0);
    resource.rating.average = totalRating / resource.reviews.length;
    resource.rating.count = resource.reviews.length;

    await resource.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: resource.reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding review',
      error: error.message,
    });
  }
};

// ==================== ADMIN ROUTES ====================

// @desc    Create resource
// @route   POST /api/resources/admin
// @access  Private (Admin)
exports.createResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    const resourceData = {
      ...req.body,
      file: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      },
      author: req.user.id,
    };

    const resource = await Resource.create(resourceData);

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: resource,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating resource',
      error: error.message,
    });
  }
};

// @desc    Update resource
// @route   PUT /api/resources/admin/:id
// @access  Private (Admin)
exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    const updateData = { ...req.body };

    // If new file uploaded
    if (req.file) {
      // Delete old file
      if (resource.file.publicId) {
        await cloudinary.uploader.destroy(resource.file.publicId);
      }

      updateData.file = {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      };
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: updatedResource,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating resource',
      error: error.message,
    });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/admin/:id
// @access  Private (Admin)
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Delete file from cloudinary
    if (resource.file.publicId) {
      await cloudinary.uploader.destroy(resource.file.publicId);
    }

    await resource.deleteOne();

    res.json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting resource',
      error: error.message,
    });
  }
};

// @desc    Get all resources (admin)
// @route   GET /api/resources/admin
// @access  Private (Admin)
exports.getAllResources = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const resources = await Resource.find(query)
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Resource.countDocuments(query);

    res.json({
      success: true,
      count: resources.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
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
