const express = require('express');
const {
  getSubscriptions,
  getProviderSubscription,
  createSubscription,
  verifyPayment,
  cancelSubscription
} = require('../controllers/subscriptions');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, authorize('admin'), getSubscriptions)
  .post(protect, authorize('provider'), createSubscription);

router
  .route('/provider')
  .get(protect, authorize('provider'), getProviderSubscription);

router
  .route('/verify')
  .post(protect, authorize('provider'), verifyPayment);

router
  .route('/cancel')
  .put(protect, authorize('provider'), cancelSubscription);

module.exports = router;