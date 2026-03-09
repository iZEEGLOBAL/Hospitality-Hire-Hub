const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  updateComment,
  deleteComment,
  likeComment,
  reportPost,
  getCategories,
  getTrendingPosts,
  getAllPosts,
  updatePostStatus,
  pinPost,
} = require('../controllers/communityController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validatePost, validateComment } = require('../middleware/validation');

// Public routes
router.get('/posts', optionalAuth, getPosts);
router.get('/posts/:id', optionalAuth, getPost);
router.get('/categories', getCategories);
router.get('/trending', getTrendingPosts);

// Protected routes
router.post('/posts', protect, validatePost, createPost);
router.put('/posts/:id', protect, updatePost);
router.delete('/posts/:id', protect, deletePost);
router.post('/posts/:id/like', protect, likePost);
router.post('/posts/:id/report', protect, reportPost);
router.post('/posts/:id/comments', protect, validateComment, addComment);
router.put('/posts/:postId/comments/:commentId', protect, updateComment);
router.delete('/posts/:postId/comments/:commentId', protect, deleteComment);
router.post('/posts/:postId/comments/:commentId/like', protect, likeComment);

// Admin routes
router.get('/admin/posts', protect, authorize('admin'), getAllPosts);
router.put('/admin/posts/:id/status', protect, authorize('admin'), updatePostStatus);
router.put('/admin/posts/:id/pin', protect, authorize('admin'), pinPost);

module.exports = router;
