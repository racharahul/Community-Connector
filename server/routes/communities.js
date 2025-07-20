const express = require('express');
const router = express.Router();
const { 
  getCommunities, 
  getCommunity, 
  createCommunity, 
  updateCommunity, 
  deleteCommunity 
} = require('../controllers/communities');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getCommunities)
  .post(protect, authorize('admin'), createCommunity);

router.route('/:id')
  .get(getCommunity)
  .put(protect, authorize('admin'), updateCommunity)
  .delete(protect, authorize('admin'), deleteCommunity);

module.exports = router;