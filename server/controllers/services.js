const Service = require('../models/Service');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Service.find(JSON.parse(queryStr))
      .populate({
        path: 'provider',
        select: 'firstName lastName email phone'
      })
      .populate('category subCategory');

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Service.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const services = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: services.length,
      pagination,
      data: services
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate({
        path: 'provider',
        select: 'firstName lastName email phone'
      })
      .populate('category subCategory')
      .populate({
        path: 'reviews',
        populate: {
          path: 'customer',
          select: 'firstName lastName'
        }
      });

    if (!service) {
      return res.status(404).json({ success: false, message: `Service not found with id of ${req.params.id}` });
    }

    res.status(200).json({ success: true, data: service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Provider only)
exports.createService = async (req, res, next) => {
  try {
    // Check if user is a provider
    if (req.user.role !== 'provider') {
      return res.status(403).json({ success: false, message: 'Only service providers can create services' });
    }

    // Check if provider has an active subscription
    const subscription = await Subscription.findOne({ 
      provider: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (!subscription) {
      return res.status(403).json({ 
        success: false, 
        message: 'You need an active subscription to create services' 
      });
    }

    // Add user to req.body
    req.body.provider = req.user.id;
    
    // Add community to req.body
    req.body.community = req.user.community;

    const service = await Service.create(req.body);

    res.status(201).json({ success: true, data: service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Provider only)
exports.updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: `Service not found with id of ${req.params.id}` });
    }

    // Make sure user is service owner
    if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this service' });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Provider only)
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: `Service not found with id of ${req.params.id}` });
    }

    // Make sure user is service owner
    if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this service' });
    }

    await service.remove();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get services by community
// @route   GET /api/services/community/:communityId
// @access  Public
exports.getServicesByCommunity = async (req, res, next) => {
  try {
    const services = await Service.find({ 
      community: req.params.communityId,
      isActive: true 
    })
      .populate({
        path: 'provider',
        select: 'firstName lastName'
      })
      .populate('category subCategory');

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get services by provider
// @route   GET /api/services/provider/:providerId
// @access  Public
exports.getServicesByProvider = async (req, res, next) => {
  try {
    const services = await Service.find({ 
      provider: req.params.providerId,
      isActive: true 
    })
      .populate('category subCategory');

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};