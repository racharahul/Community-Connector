const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
// @access  Private (Admin only)
exports.getSubscriptions = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this route' });
    }

    const subscriptions = await Subscription.find().populate({
      path: 'provider',
      select: 'firstName lastName email'
    });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get provider's subscription
// @route   GET /api/subscriptions/provider
// @access  Private (Provider only)
exports.getProviderSubscription = async (req, res, next) => {
  try {
    // Check if user is a provider
    if (req.user.role !== 'provider') {
      return res.status(403).json({ success: false, message: 'Only providers can access subscription information' });
    }

    const subscription = await Subscription.findOne({ 
      provider: req.user.id,
      status: { $in: ['active', 'pending'] }
    }).sort('-createdAt');

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'No active subscription found' });
    }

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create subscription order
// @route   POST /api/subscriptions
// @access  Private (Provider only)
exports.createSubscription = async (req, res, next) => {
  try {
    // Check if user is a provider
    if (req.user.role !== 'provider') {
      return res.status(403).json({ success: false, message: 'Only providers can create subscriptions' });
    }

    // Check if provider already has an active subscription
    const existingSubscription = await Subscription.findOne({
      provider: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription'
      });
    }

    const { plan } = req.body;

    // Define subscription plans
    const plans = {
      basic: {
        amount: 499, // ₹499 per month
        currency: 'INR',
        period: 'monthly',
        interval: 1
      }
      // Add more plans as needed
    };

    if (!plans[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan' });
    }

    // Create a subscription in Razorpay
    const options = {
      plan_id: plan,
      customer_notify: 1,
      total_count: 12, // 12 months
      quantity: 1,
      notes: {
        userId: req.user.id
      }
    };

    // Create a Razorpay order for the first payment
    const order = await razorpay.orders.create({
      amount: plans[plan].amount * 100, // Amount in paise
      currency: plans[plan].currency,
      receipt: `subscription_${req.user.id}_${Date.now()}`,
      notes: {
        userId: req.user.id,
        plan: plan
      }
    });

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    // Create subscription record in database
    const subscription = await Subscription.create({
      provider: req.user.id,
      plan,
      status: 'pending',
      paymentGatewayId: order.id,
      startDate,
      endDate,
      amount: plans[plan].amount,
      currency: plans[plan].currency
    });

    res.status(201).json({
      success: true,
      data: {
        subscription,
        order
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify subscription payment
// @route   POST /api/subscriptions/verify
// @access  Private (Provider only)
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    // Verify the payment signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Find the subscription by order ID
    const subscription = await Subscription.findOne({ paymentGatewayId: razorpay_order_id });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // Update subscription status
    subscription.status = 'active';
    subscription.paymentMethod = 'razorpay';
    subscription.invoices.push({
      invoiceId: razorpay_payment_id,
      amount: subscription.amount,
      status: 'paid',
      paidAt: new Date()
    });

    await subscription.save();

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Cancel subscription
// @route   PUT /api/subscriptions/cancel
// @access  Private (Provider only)
exports.cancelSubscription = async (req, res, next) => {
  try {
    // Find the provider's active subscription
    const subscription = await Subscription.findOne({
      provider: req.user.id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'No active subscription found' });
    }

    // Update subscription status
    subscription.status = 'cancelled';
    subscription.cancellationReason = req.body.reason || 'User cancelled';
    subscription.cancellationDate = new Date();

    await subscription.save();

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};