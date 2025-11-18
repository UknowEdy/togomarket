const express = require('express');
const router = express.Router();
const {
  createReview,
  getUserReviews,
  getReviewsByUser,
  updateReview,
  deleteReview,
  reportReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Routes publiques
router.get('/user/:userId', getUserReviews);

// Routes protégées
router.post('/', protect, createReview);
router.get('/by-user/:userId', protect, getReviewsByUser);
router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);
router.put('/:reviewId/report', protect, reportReview);

module.exports = router;
