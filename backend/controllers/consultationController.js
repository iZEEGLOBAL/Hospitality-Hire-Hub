const Consultation = require('../models/Consultation');
const User = require('../models/User');

// @desc    Create consultation request
// @route   POST /api/consultations
// @access  Private
exports.createConsultation = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const consultationData = {
      ...req.body,
      client: req.user.id,
      clientName: `${user.firstName} ${user.lastName}`,
      clientEmail: user.email,
      clientPhone: user.phone,
    };

    const consultation = await Consultation.create(consultationData);

    // Update user's consultation profile
    if (user.role === 'consultation_client') {
      user.consultationProfile.businessName = req.body.businessName;
      user.consultationProfile.businessType = req.body.businessType;
      user.consultationProfile.propertyDescription = req.body.propertyDescription;
      user.consultationProfile.consultationHistory.push({
        consultationId: consultation._id,
        type: req.body.type,
        status: 'pending',
        date: new Date(),
      });
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Consultation request submitted successfully',
      data: consultation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating consultation request',
      error: error.message,
    });
  }
};

// @desc    Get user's consultations
// @route   GET /api/consultations/my
// @access  Private
exports.getMyConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ client: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: consultations.length,
      data: consultations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching consultations',
      error: error.message,
    });
  }
};

// @desc    Get single consultation
// @route   GET /api/consultations/:id
// @access  Private
exports.getConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findOne({
      _id: req.params.id,
      client: req.user.id,
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    res.json({
      success: true,
      data: consultation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching consultation',
      error: error.message,
    });
  }
};

// @desc    Cancel consultation
// @route   PUT /api/consultations/:id/cancel
// @access  Private
exports.cancelConsultation = async (req, res) => {
  try {
    const { reason } = req.body;

    const consultation = await Consultation.findOne({
      _id: req.params.id,
      client: req.user.id,
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    if (consultation.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed consultation',
      });
    }

    if (consultation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Consultation is already cancelled',
      });
    }

    consultation.status = 'cancelled';
    consultation.cancellationReason = reason;
    consultation.cancelledBy = req.user.id;
    await consultation.save();

    res.json({
      success: true,
      message: 'Consultation cancelled successfully',
      data: consultation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling consultation',
      error: error.message,
    });
  }
};

// @desc    Submit feedback
// @route   POST /api/consultations/:id/feedback
// @access  Private
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const consultation = await Consultation.findOne({
      _id: req.params.id,
      client: req.user.id,
      status: 'completed',
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found or not completed',
      });
    }

    if (consultation.clientFeedback.submittedAt) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already submitted',
      });
    }

    consultation.clientFeedback = {
      rating,
      comment,
      submittedAt: new Date(),
    };

    await consultation.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: consultation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message,
    });
  }
};

// ==================== ADMIN ROUTES ====================

// @desc    Get all consultations
// @route   GET /api/consultations/admin
// @access  Private (Admin)
exports.getAllConsultations = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const consultations = await Consultation.find(query)
      .populate('client', 'firstName lastName email phone')
      .populate('assignedConsultant', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Consultation.countDocuments(query);

    res.json({
      success: true,
      count: consultations.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: consultations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching consultations',
      error: error.message,
    });
  }
};

// @desc    Get consultation by ID (admin)
// @route   GET /api/consultations/admin/:id
// @access  Private (Admin)
exports.getConsultationById = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('client', 'firstName lastName email phone')
      .populate('assignedConsultant', 'firstName lastName email');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    res.json({
      success: true,
      data: consultation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching consultation',
      error: error.message,
    });
  }
};

// @desc    Update consultation status
// @route   PUT /api/consultations/admin/:id/status
// @access  Private (Admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    consultation.status = status;

    if (status === 'completed') {
      consultation.completedAt = new Date();
    }

    await consultation.save();

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: consultation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message,
    });
  }
};

// @desc    Schedule consultation
// @route   PUT /api/consultations/admin/:id/schedule
// @access  Private (Admin)
exports.scheduleConsultation = async (req, res) => {
  try {
    const {
      scheduledDate,
      scheduledTime,
      duration,
      meetingDetails,
      physicalLocation,
      assignedConsultant,
    } = req.body;

    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    consultation.status = 'scheduled';
    consultation.scheduledDate = scheduledDate;
    consultation.scheduledTime = scheduledTime;
    consultation.duration = duration || 60;
    consultation.meetingDetails = meetingDetails;
    consultation.physicalLocation = physicalLocation;
    consultation.assignedConsultant = assignedConsultant;

    await consultation.save();

    res.json({
      success: true,
      message: 'Consultation scheduled successfully',
      data: consultation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error scheduling consultation',
      error: error.message,
    });
  }
};

// @desc    Add consultant notes
// @route   PUT /api/consultations/admin/:id/notes
// @access  Private (Admin)
exports.addNotes = async (req, res) => {
  try {
    const { notes } = req.body;

    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    consultation.consultantNotes = notes;
    await consultation.save();

    res.json({
      success: true,
      message: 'Notes added successfully',
      data: consultation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding notes',
      error: error.message,
    });
  }
};

// @desc    Add communication
// @route   POST /api/consultations/admin/:id/communication
// @access  Private (Admin)
exports.addCommunication = async (req, res) => {
  try {
    const { type, message } = req.body;

    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    consultation.communicationHistory.push({
      type,
      message,
      sentBy: req.user.id,
    });

    await consultation.save();

    res.json({
      success: true,
      message: 'Communication added successfully',
      data: consultation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding communication',
      error: error.message,
    });
  }
};

// @desc    Set cost
// @route   PUT /api/consultations/admin/:id/cost
// @access  Private (Admin)
exports.setCost = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    consultation.cost = {
      amount,
      currency: currency || 'NGN',
      isPaid: false,
    };

    await consultation.save();

    res.json({
      success: true,
      message: 'Cost set successfully',
      data: consultation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting cost',
      error: error.message,
    });
  }
};

// @desc    Mark as paid
// @route   PUT /api/consultations/admin/:id/mark-paid
// @access  Private (Admin)
exports.markAsPaid = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    consultation.cost.isPaid = true;
    consultation.cost.paidAt = new Date();
    consultation.cost.transactionId = transactionId;

    await consultation.save();

    res.json({
      success: true,
      message: 'Marked as paid successfully',
      data: consultation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking as paid',
      error: error.message,
    });
  }
};
