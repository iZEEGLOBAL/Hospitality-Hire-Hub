const Testimonial = require('../models/Testimonial');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
exports.getTestimonials = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    const query = { status: 'approved' };
    if (category) query.category = category;

    const testimonials = await Testimonial.find(query)
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Testimonial.countDocuments(query);

    res.json({
      success: true,
      count: testimonials.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: testimonials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching testimonials',
      error: error.message,
    });
  }
};

// @desc    Get featured testimonials
// @route   GET /api/testimonials/featured
// @access  Public
exports.getFeatured = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const testimonials = await Testimonial.find({
      status: 'approved',
      isFeatured: true,
    })
      .sort({ order: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured testimonials',
      error: error.message,
    });
  }
};

// @desc    Get single testimonial
// @route   GET /api/testimonials/:id
// @access  Public
exports.getTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    res.json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching testimonial',
      error: error.message,
    });
  }
};

// @desc    Submit testimonial
// @route   POST /api/testimonials
// @access  Private
exports.submitTestimonial = async (req, res) => {
  try {
    const { content, rating, category } = req.body;

    const user = await User.findById(req.user.id);

    const testimonialData = {
      name: `${user.firstName} ${user.lastName}`,
      role: user.jobSeekerProfile?.professionalTitle || user.employerProfile?.companyName || 'Member',
      company: user.employerProfile?.companyName,
      content,
      rating,
      category,
      user: req.user.id,
      status: 'pending',
    };

    const testimonial = await Testimonial.create(testimonialData);

    res.status(201).json({
      success: true,
      message: 'Testimonial submitted for review',
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting testimonial',
      error: error.message,
    });
  }
};

// ==================== ADMIN ROUTES ====================

// @desc    Get all testimonials (admin)
// @route   GET /api/testimonials/admin
// @access  Private (Admin)
exports.getAllTestimonials = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const testimonials = await Testimonial.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Testimonial.countDocuments(query);

    res.json({
      success: true,
      count: testimonials.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: testimonials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching testimonials',
      error: error.message,
    });
  }
};

// @desc    Create testimonial (admin)
// @route   POST /api/testimonials/admin
// @access  Private (Admin)
exports.createTestimonial = async (req, res) => {
  try {
    let testimonialData = { ...req.body };

    if (req.file) {
      testimonialData.photo = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    const testimonial = await Testimonial.create(testimonialData);

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating testimonial',
      error: error.message,
    });
  }
};

// @desc    Update testimonial
// @route   PUT /api/testimonials/admin/:id
// @access  Private (Admin)
exports.updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    const updateData = { ...req.body };

    if (req.file) {
      // Delete old photo
      if (testimonial.photo?.publicId) {
        await cloudinary.uploader.destroy(testimonial.photo.publicId);
      }

      updateData.photo = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Testimonial updated successfully',
      data: updatedTestimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating testimonial',
      error: error.message,
    });
  }
};

// @desc    Delete testimonial
// @route   DELETE /api/testimonials/admin/:id
// @access  Private (Admin)
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    // Delete photo from cloudinary
    if (testimonial.photo?.publicId) {
      await cloudinary.uploader.destroy(testimonial.photo.publicId);
    }

    await testimonial.deleteOne();

    res.json({
      success: true,
      message: 'Testimonial deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting testimonial',
      error: error.message,
    });
  }
};

// @desc    Approve testimonial
// @route   PUT /api/testimonials/admin/:id/approve
// @access  Private (Admin)
exports.approveTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    testimonial.status = 'approved';
    testimonial.approvedBy = req.user.id;
    testimonial.approvedAt = new Date();

    await testimonial.save();

    res.json({
      success: true,
      message: 'Testimonial approved successfully',
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving testimonial',
      error: error.message,
    });
  }
};

// @desc    Reject testimonial
// @route   PUT /api/testimonials/admin/:id/reject
// @access  Private (Admin)
exports.rejectTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    testimonial.status = 'rejected';

    await testimonial.save();

    res.json({
      success: true,
      message: 'Testimonial rejected',
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting testimonial',
      error: error.message,
    });
  }
};

// @desc    Feature/Unfeature testimonial
// @route   PUT /api/testimonials/admin/:id/feature
// @access  Private (Admin)
exports.featureTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    testimonial.isFeatured = !testimonial.isFeatured;
    await testimonial.save();

    res.json({
      success: true,
      message: testimonial.isFeatured ? 'Testimonial featured' : 'Testimonial unfeatured',
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating testimonial',
      error: error.message,
    });
  }
};
