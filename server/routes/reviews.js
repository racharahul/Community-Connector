const express = require('express');
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
  addProviderResponse,
  reportReview
} = require('../controllers/reviews');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(getReviews)
  .post(protect, authorize('customer'), addReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router
  .route('/:id/response')
  .put(protect, authorize('provider'), addProviderResponse);

router
  .route('/:id/report')
  .put(protect, reportReview);

module.exports = router;