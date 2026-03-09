const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Get all posts
// @route   GET /api/community/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const {
      category,
      type,
      search,
      sort = '-lastActivity',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { status: 'active' };

    if (category) query.category = category;
    if (type) query.type = type;
    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = {};
    if (sort === '-lastActivity') sortOption = { lastActivity: -1 };
    else if (sort === '-createdAt') sortOption = { createdAt: -1 };
    else if (sort === 'likes') sortOption = { likes: -1 };
    else if (sort === 'views') sortOption = { views: -1 };

    const posts = await Post.find(query)
      .populate('author', 'firstName lastName photo jobSeekerProfile.professionalTitle')
      .select('-comments -reports')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message,
    });
  }
};

// @desc    Get single post
// @route   GET /api/community/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName photo jobSeekerProfile.professionalTitle employerProfile.companyName')
      .populate('comments.author', 'firstName lastName photo');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Increment views
    await post.incrementViews();

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching post',
      error: error.message,
    });
  }
};

// @desc    Create post
// @route   POST /api/community/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const postData = {
      ...req.body,
      author: req.user.id,
      authorName: `${user.firstName} ${user.lastName}`,
      authorPhoto: user.photo?.url,
      authorRole: user.role,
    };

    const post = await Post.create(postData);

    await post.populate('author', 'firstName lastName photo');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message,
    });
  }
};

// @desc    Update post
// @route   PUT /api/community/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user.id,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or you are not authorized to edit it',
      });
    }

    const { title, content, category, tags } = req.body;

    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags || post.tags;

    await post.save();

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating post',
      error: error.message,
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/community/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user.id,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or you are not authorized to delete it',
      });
    }

    post.status = 'deleted';
    await post.save();

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message,
    });
  }
};

// @desc    Like post
// @route   POST /api/community/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if already liked
    const alreadyLiked = post.likes.find(
      (like) => like.user.toString() === req.user.id
    );

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(
        (like) => like.user.toString() !== req.user.id
      );
    } else {
      // Like
      post.likes.push({ user: req.user.id });
    }

    await post.save();

    res.json({
      success: true,
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      data: { likesCount: post.likes.length },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error liking post',
      error: error.message,
    });
  }
};

// @desc    Add comment
// @route   POST /api/community/posts/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const user = await User.findById(req.user.id);

    post.comments.push({
      author: req.user.id,
      authorName: `${user.firstName} ${user.lastName}`,
      authorPhoto: user.photo?.url,
      content,
    });

    await post.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: post.comments[post.comments.length - 1],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message,
    });
  }
};

// @desc    Update comment
// @route   PUT /api/community/posts/:postId/comments/:commentId
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this comment',
      });
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    await post.save();

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating comment',
      error: error.message,
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/community/posts/:postId/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    post.comments.pull(req.params.commentId);
    await post.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message,
    });
  }
};

// @desc    Like comment
// @route   POST /api/community/posts/:postId/comments/:commentId/like
// @access  Private
exports.likeComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if already liked
    const alreadyLiked = comment.likes.find(
      (like) => like.user.toString() === req.user.id
    );

    if (alreadyLiked) {
      // Unlike
      comment.likes = comment.likes.filter(
        (like) => like.user.toString() !== req.user.id
      );
    } else {
      // Like
      comment.likes.push({ user: req.user.id });
    }

    await post.save();

    res.json({
      success: true,
      message: alreadyLiked ? 'Comment unliked' : 'Comment liked',
      data: { likesCount: comment.likes.length },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error liking comment',
      error: error.message,
    });
  }
};

// @desc    Report post
// @route   POST /api/community/posts/:id/report
// @access  Private
exports.reportPost = async (req, res) => {
  try {
    const { reason, details } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if already reported by this user
    const alreadyReported = post.reports.find(
      (report) => report.reportedBy.toString() === req.user.id
    );

    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this post',
      });
    }

    post.reports.push({
      reportedBy: req.user.id,
      reason,
      details,
    });

    // If reports exceed threshold, hide post
    if (post.reports.length >= 5) {
      post.status = 'reported';
    }

    await post.save();

    res.json({
      success: true,
      message: 'Post reported successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reporting post',
      error: error.message,
    });
  }
};

// @desc    Get categories
// @route   GET /api/community/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      { value: 'general', label: 'General Discussion' },
      { value: 'career_advice', label: 'Career Advice' },
      { value: 'interview_tips', label: 'Interview Tips' },
      { value: 'industry_news', label: 'Industry News' },
      { value: 'job_search', label: 'Job Search' },
      { value: 'workplace', label: 'Workplace' },
      { value: 'training', label: 'Training' },
      { value: 'certification', label: 'Certification' },
      { value: 'hospitality_trends', label: 'Hospitality Trends' },
      { value: 'success_stories', label: 'Success Stories' },
      { value: 'help', label: 'Help & Support' },
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

// @desc    Get trending posts
// @route   GET /api/community/trending
// @access  Public
exports.getTrendingPosts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const posts = await Post.find({ status: 'active' })
      .sort({ views: -1, likes: -1 })
      .limit(parseInt(limit))
      .populate('author', 'firstName lastName photo')
      .select('title content author views likes comments createdAt');

    res.json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trending posts',
      error: error.message,
    });
  }
};

// ==================== ADMIN ROUTES ====================

// @desc    Get all posts (admin)
// @route   GET /api/community/admin/posts
// @access  Private (Admin)
exports.getAllPosts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const posts = await Post.find(query)
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message,
    });
  }
};

// @desc    Hide/Show post
// @route   PUT /api/community/admin/posts/:id/status
// @access  Private (Admin)
exports.updatePostStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    post.status = status;
    await post.save();

    res.json({
      success: true,
      message: `Post ${status === 'active' ? 'shown' : 'hidden'} successfully`,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating post status',
      error: error.message,
    });
  }
};

// @desc    Pin/Unpin post
// @route   PUT /api/community/admin/posts/:id/pin
// @access  Private (Admin)
exports.pinPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({
      success: true,
      message: post.isPinned ? 'Post pinned' : 'Post unpinned',
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error pinning post',
      error: error.message,
    });
  }
};
