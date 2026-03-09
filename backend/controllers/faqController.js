const FAQ = require('../models/FAQ');

// @desc    Get all FAQs
// @route   GET /api/faqs
// @access  Public
exports.getFAQs = async (req, res) => {
  try {
    const { category } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;

    const faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQs',
      error: error.message,
    });
  }
};

// @desc    Get single FAQ
// @route   GET /api/faqs/:id
// @access  Public
exports.getFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }

    res.json({
      success: true,
      data: faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQ',
      error: error.message,
    });
  }
};

// @desc    Mark FAQ as helpful
// @route   POST /api/faqs/:id/helpful
// @access  Public
exports.markHelpful = async (req, res) => {
  try {
    const { helpful } = req.body; // true or false

    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }

    if (helpful) {
      faq.helpful += 1;
    } else {
      faq.notHelpful += 1;
    }

    await faq.save();

    res.json({
      success: true,
      message: 'Feedback recorded',
      data: faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error recording feedback',
      error: error.message,
    });
  }
};

// @desc    Get FAQ categories
// @route   GET /api/faqs/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      { value: 'general', label: 'General' },
      { value: 'job_seekers', label: 'Job Seekers' },
      { value: 'employers', label: 'Employers' },
      { value: 'subscription', label: 'Subscription' },
      { value: 'payment', label: 'Payment' },
      { value: 'interview', label: 'Interview' },
      { value: 'certification', label: 'Certification' },
      { value: 'consultation', label: 'Consultation' },
      { value: 'technical', label: 'Technical Support' },
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

// ==================== ADMIN ROUTES ====================

// @desc    Get all FAQs (admin)
// @route   GET /api/faqs/admin
// @access  Private (Admin)
exports.getAllFAQs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const faqs = await FAQ.find()
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await FAQ.countDocuments();

    res.json({
      success: true,
      count: faqs.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: faqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQs',
      error: error.message,
    });
  }
};

// @desc    Create FAQ
// @route   POST /api/faqs/admin
// @access  Private (Admin)
exports.createFAQ = async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating FAQ',
      error: error.message,
    });
  }
};

// @desc    Update FAQ
// @route   PUT /api/faqs/admin/:id
// @access  Private (Admin)
exports.updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }

    res.json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating FAQ',
      error: error.message,
    });
  }
};

// @desc    Delete FAQ
// @route   DELETE /api/faqs/admin/:id
// @access  Private (Admin)
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }

    await faq.deleteOne();

    res.json({
      success: true,
      message: 'FAQ deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting FAQ',
      error: error.message,
    });
  }
};

// @desc    Toggle FAQ status
// @route   PUT /api/faqs/admin/:id/status
// @access  Private (Admin)
exports.toggleStatus = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }

    faq.isActive = !faq.isActive;
    await faq.save();

    res.json({
      success: true,
      message: `FAQ ${faq.isActive ? 'activated' : 'deactivated'}`,
      data: faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling FAQ status',
      error: error.message,
    });
  }
};
