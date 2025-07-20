const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServicesByCommunity,
  getServicesByProvider
} = require('../controllers/services');

// Include review router for nested routes
const reviewRouter = require('./reviews');

const router = express.Router();

const { protect, authorize, verifyCommunityMember, verifySubscription } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:serviceId/reviews', reviewRouter);

// Community and provider specific routes
router.get('/community/:communityId', verifyCommunityMember, getServicesByCommunity);
router.get('/provider/:providerId', getServicesByProvider);

// Main service routes
router
  .route('/')
  .get(getServices)
  .post(protect, authorize('provider'), verifySubscription, createService);

router
  .route('/:id')
  .get(getService)
  .put(protect, authorize('provider', 'admin'), updateService)
  .delete(protect, authorize('provider', 'admin'), deleteService);

module.exports = router;