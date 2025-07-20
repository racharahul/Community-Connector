const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user to req object
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

// Verify community membership
exports.verifyCommunityMember = async (req, res, next) => {
  try {
    // Get community ID from request params or body
    const communityId = req.params.communityId || req.body.community;

    if (!communityId) {
      return next();
    }

    // Check if user belongs to the specified community
    if (req.user.community.toString() !== communityId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to access resources from this community' 
      });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Verify subscription status for providers
exports.verifySubscription = async (req, res, next) => {
  try {
    // Skip for non-providers or admin
    if (req.user.role !== 'provider' || req.user.role === 'admin') {
      return next();
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
        message: 'You need an active subscription to access this feature' 
      });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};