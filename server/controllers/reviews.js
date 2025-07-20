const Review = require('../models/Review');
const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    let query;

    if (req.params.serviceId) {
      // Get reviews for a specific service
      query = Review.find({ service: req.params.serviceId });
    } else {
      // Get all reviews
      query = Review.find();
    }

    // Add population
    query = query.populate({
      path: 'customer',
      select: 'firstName lastName'
    }).populate({
      path: 'service',
      select: 'title'
    });

    // Execute query
    const reviews = await query;

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate({
      path: 'customer',
      select: 'firstName lastName'
    }).populate({
      path: 'service',
      select: 'title provider',
      populate: {
        path: 'provider',
        select: 'firstName lastName'
      }
    });

    if (!review) {
      return res.status(404).json({ success: false, message: `Review not found with id of ${req.params.id}` });
    }

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add review
// @route   POST /api/services/:serviceId/reviews
// @access  Private (Customer only)
exports.addReview = async (req, res, next) => {
  try {
    // Add service and customer to req.body
    req.body.service = req.params.serviceId;
    req.body.customer = req.user.id;

    // Check if service exists
    const service = await Service.findById(req.params.serviceId);

    if (!service) {
      return res.status(404).json({ success: false, message: `Service not found with id of ${req.params.serviceId}` });
    }

    // Check if user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Only customers can submit reviews' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      service: req.params.serviceId,
      customer: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this service' });
    }

    // Create review
    const review = await Review.create(req.body);

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Review owner only)
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: `Review not found with id of ${req.params.id}` });
    }

    // Make sure review belongs to user or user is admin
    if (review.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this review' });
    }

    // Update review
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Review owner or admin only)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: `Review not found with id of ${req.params.id}` });
    }

    // Make sure review belongs to user or user is admin
    if (review.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this review' });
    }

    await review.remove();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add provider response to review
// @route   PUT /api/reviews/:id/response
// @access  Private (Service provider only)
exports.addProviderResponse = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id).populate({
      path: 'service',
      select: 'provider'
    });

    if (!review) {
      return res.status(404).json({ success: false, message: `Review not found with id of ${req.params.id}` });
    }

    // Make sure user is the service provider
    if (review.service.provider.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to respond to this review' });
    }

    // Update review with provider response
    review = await Review.findByIdAndUpdate(req.params.id, 
      { providerResponse: req.body.providerResponse },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Report a review
// @route   PUT /api/reviews/:id/report
// @access  Private
exports.reportReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: `Review not found with id of ${req.params.id}` });
    }

    // Update review with report information
    review = await Review.findByIdAndUpdate(req.params.id, 
      { 
        isReported: true,
        reportReason: req.body.reportReason 
      },
      { new: true }
    );

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};