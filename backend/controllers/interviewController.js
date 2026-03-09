const InterviewQuestion = require('../models/InterviewQuestion');
const InterviewSession = require('../models/InterviewSession');
const User = require('../models/User');
const Resource = require('../models/Resource');

// @desc    Get interview questions by department
// @route   GET /api/interview/questions/:department
// @access  Private (Job Seeker)
exports.getQuestions = async (req, res) => {
  try {
    const { department } = req.params;
    const { difficulty, limit = 20 } = req.query;

    const query = {
      department,
      isActive: true,
    };

    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Get random questions
    const questions = await InterviewQuestion.aggregate([
      { $match: query },
      { $sample: { size: parseInt(limit) } },
      {
        $project: {
          question: 1,
          type: 1,
          difficulty: 1,
          options: 1,
          points: 1,
          category: 1,
          timeLimit: 1,
        },
      },
    ]);

    res.json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message,
    });
  }
};

// @desc    Start interview session
// @route   POST /api/interview/start
// @access  Private (Job Seeker)
exports.startInterview = async (req, res) => {
  try {
    const { department } = req.body;

    const user = await User.findById(req.user.id);

    // Check if user has active subscription for interview
    if (user.subscription.plan === 'free') {
      return res.status(403).json({
        success: false,
        message: 'Please upgrade to Pro plan to take certification interviews',
      });
    }

    // Check if there's an in-progress session
    const existingSession = await InterviewSession.findOne({
      user: req.user.id,
      department,
      status: 'in_progress',
    });

    if (existingSession) {
      return res.json({
        success: true,
        message: 'Continuing existing session',
        data: existingSession,
      });
    }

    // Get questions for the interview
    const questions = await InterviewQuestion.aggregate([
      {
        $match: {
          department,
          isActive: true,
        },
      },
      { $sample: { size: 20 } },
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions available for this department',
      });
    }

    // Get attempt number
    const previousAttempts = await InterviewSession.countDocuments({
      user: req.user.id,
      department,
    });

    // Create session
    const session = await InterviewSession.create({
      user: req.user.id,
      department,
      questions: questions.map((q) => ({
        questionId: q._id,
        question: q.question,
        options: q.options,
        type: q.type,
        correctAnswer: q.correctAnswer,
        points: q.points || 1,
      })),
      attemptNumber: previousAttempts + 1,
    });

    res.status(201).json({
      success: true,
      message: 'Interview session started',
      data: {
        sessionId: session._id,
        department: session.department,
        totalQuestions: questions.length,
        attemptNumber: session.attemptNumber,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting interview',
      error: error.message,
    });
  }
};

// @desc    Submit answer
// @route   POST /api/interview/:sessionId/answer
// @access  Private (Job Seeker)
exports.submitAnswer = async (req, res) => {
  try {
    const { questionIndex, answer } = req.body;

    const session = await InterviewSession.findOne({
      _id: req.params.sessionId,
      user: req.user.id,
      status: 'in_progress',
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or already completed',
      });
    }

    if (questionIndex < 0 || questionIndex >= session.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index',
      });
    }

    const question = session.questions[questionIndex];

    // Check answer
    let isCorrect = false;
    let earnedPoints = 0;

    if (question.type === 'multiple_choice') {
      const correctOption = question.options.find((opt) => opt.isCorrect);
      isCorrect = correctOption && correctOption.text === answer;
      earnedPoints = isCorrect ? question.points : 0;
    } else if (question.type === 'true_false') {
      isCorrect = question.correctAnswer === answer;
      earnedPoints = isCorrect ? question.points : 0;
    } else {
      // For open-ended questions, mark as pending review
      earnedPoints = 0;
    }

    // Update question with answer
    session.questions[questionIndex].userAnswer = answer;
    session.questions[questionIndex].isCorrect = isCorrect;
    session.questions[questionIndex].earnedPoints = earnedPoints;
    session.questions[questionIndex].answeredAt = new Date();

    await session.save();

    res.json({
      success: true,
      data: {
        isCorrect,
        earnedPoints,
        correctAnswer: question.type !== 'open_ended' ? question.correctAnswer : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting answer',
      error: error.message,
    });
  }
};

// @desc    Complete interview
// @route   POST /api/interview/:sessionId/complete
// @access  Private (Job Seeker)
exports.completeInterview = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.sessionId,
      user: req.user.id,
      status: 'in_progress',
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or already completed',
      });
    }

    // Calculate results
    const totalQuestions = session.questions.length;
    const answeredQuestions = session.questions.filter((q) => q.userAnswer).length;
    const correctAnswers = session.questions.filter((q) => q.isCorrect).length;
    const totalPoints = session.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const earnedPoints = session.questions.reduce((sum, q) => sum + (q.earnedPoints || 0), 0);
    const percentage = Math.round((earnedPoints / totalPoints) * 100);

    // Determine grade and status
    let grade;
    let status;

    if (percentage >= 80) {
      grade = 'A';
      status = 'passed';
    } else if (percentage >= 70) {
      grade = 'B';
      status = 'passed';
    } else if (percentage >= 60) {
      grade = 'C';
      status = 'passed';
    } else if (percentage >= 50) {
      grade = 'D';
      status = 'failed';
    } else {
      grade = 'F';
      status = 'failed';
    }

    // Update session
    session.status = 'completed';
    session.completedAt = new Date();
    session.duration = Math.floor((session.completedAt - session.startedAt) / 1000);
    session.results = {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      totalPoints,
      earnedPoints,
      percentage,
      grade,
      status,
    };

    // Get recommended resources if failed
    if (status === 'failed') {
      const resources = await Resource.find({
        department: session.department,
        accessType: 'free',
        status: 'published',
      })
        .limit(5)
        .select('_id');

      session.recommendedResources = resources.map((r) => r._id);
    }

    await session.save();

    // Update user certification status if passed
    if (status === 'passed') {
      const user = await User.findById(req.user.id);

      // Check if already certified for this department
      const existingResult = user.jobSeekerProfile.interviewResults.find(
        (r) => r.department === session.department
      );

      if (existingResult) {
        // Update if better score
        if (percentage > existingResult.percentage) {
          existingResult.score = earnedPoints;
          existingResult.percentage = percentage;
          existingResult.status = status;
          existingResult.takenAt = new Date();
        }
      } else {
        user.jobSeekerProfile.interviewResults.push({
          department: session.department,
          score: earnedPoints,
          totalQuestions,
          percentage,
          status,
          takenAt: new Date(),
        });
      }

      // Update overall certification status
      user.jobSeekerProfile.certificationStatus = 'passed';
      await user.save();

      // Generate certificate
      session.certificationAwarded = true;
      session.certificate = {
        certificateId: `HHH-${Date.now()}-${req.user.id.toString().slice(-6)}`,
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      };
      await session.save();
    }

    res.json({
      success: true,
      message: status === 'passed' ? 'Congratulations! You passed the interview.' : 'Interview completed.',
      data: {
        sessionId: session._id,
        results: session.results,
        certificationAwarded: session.certificationAwarded,
        certificateId: session.certificate?.certificateId,
        recommendedResources: session.recommendedResources,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing interview',
      error: error.message,
    });
  }
};

// @desc    Get interview history
// @route   GET /api/interview/history
// @access  Private (Job Seeker)
exports.getInterviewHistory = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({
      user: req.user.id,
      status: { $in: ['completed', 'abandoned'] },
    })
      .select('department results status attemptNumber startedAt completedAt certificationAwarded certificate')
      .sort({ startedAt: -1 });

    res.json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching interview history',
      error: error.message,
    });
  }
};

// @desc    Get interview session
// @route   GET /api/interview/:sessionId
// @access  Private (Job Seeker)
exports.getSession = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.sessionId,
      user: req.user.id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching session',
      error: error.message,
    });
  }
};

// @desc    Abandon interview
// @route   PUT /api/interview/:sessionId/abandon
// @access  Private (Job Seeker)
exports.abandonInterview = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.sessionId,
      user: req.user.id,
      status: 'in_progress',
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    session.status = 'abandoned';
    await session.save();

    res.json({
      success: true,
      message: 'Interview abandoned',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error abandoning interview',
      error: error.message,
    });
  }
};

// @desc    Get available departments for interview
// @route   GET /api/interview/departments
// @access  Private (Job Seeker)
exports.getDepartments = async (req, res) => {
  try {
    const departments = [
      { value: 'front_office', label: 'Front Office', description: 'Reception, Guest Services, Reservations' },
      { value: 'housekeeping', label: 'Housekeeping', description: 'Room Attendants, Laundry, Public Areas' },
      { value: 'kitchen', label: 'Kitchen', description: 'Chefs, Cooks, Prep Staff' },
      { value: 'food_beverage', label: 'Food & Beverage', description: 'Restaurant, Bar, Room Service' },
      { value: 'management', label: 'Management', description: 'General Manager, Department Heads' },
      { value: 'maintenance', label: 'Maintenance', description: 'Engineering, Repairs, Facilities' },
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

// @desc    Get certificate
// @route   GET /api/interview/certificate/:sessionId
// @access  Private (Job Seeker)
exports.getCertificate = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.sessionId,
      user: req.user.id,
      certificationAwarded: true,
    }).populate('user', 'firstName lastName');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    res.json({
      success: true,
      data: {
        certificateId: session.certificate.certificateId,
        recipientName: `${session.user.firstName} ${session.user.lastName}`,
        department: session.department,
        issuedAt: session.certificate.issuedAt,
        expiresAt: session.certificate.expiresAt,
        score: session.results.percentage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching certificate',
      error: error.message,
    });
  }
};

// ==================== ADMIN ROUTES ====================

// @desc    Create interview question
// @route   POST /api/interview/admin/questions
// @access  Private (Admin)
exports.createQuestion = async (req, res) => {
  try {
    const question = await InterviewQuestion.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: error.message,
    });
  }
};

// @desc    Update interview question
// @route   PUT /api/interview/admin/questions/:id
// @access  Private (Admin)
exports.updateQuestion = async (req, res) => {
  try {
    const question = await InterviewQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message,
    });
  }
};

// @desc    Delete interview question
// @route   DELETE /api/interview/admin/questions/:id
// @access  Private (Admin)
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await InterviewQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    await question.deleteOne();

    res.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message,
    });
  }
};

// @desc    Get all questions (admin)
// @route   GET /api/interview/admin/questions
// @access  Private (Admin)
exports.getAllQuestions = async (req, res) => {
  try {
    const { department, difficulty, page = 1, limit = 20 } = req.query;

    const query = {};
    if (department) query.department = department;
    if (difficulty) query.difficulty = difficulty;

    const questions = await InterviewQuestion.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await InterviewQuestion.countDocuments(query);

    res.json({
      success: true,
      count: questions.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message,
    });
  }
};
