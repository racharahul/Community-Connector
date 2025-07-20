const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a service provider']
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'professional'],
    default: 'basic',
    required: [true, 'Please specify the subscription plan']
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'pending'],
    default: 'pending',
    required: [true, 'Please specify the subscription status']
  },
  paymentGatewayId: {
    type: String,
    description: 'ID from payment gateway (Razorpay/Stripe)'
  },
  subscriptionId: {
    type: String,
    description: 'Subscription ID from payment gateway'
  },
  customerId: {
    type: String,
    description: 'Customer ID from payment gateway'
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a subscription start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add a subscription end date']
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add the subscription amount']
  },
  currency: {
    type: String,
    default: 'INR',
    required: [true, 'Please specify the currency']
  },
  paymentMethod: {
    type: String,
    description: 'Method used for payment'
  },
  invoices: [
    {
      invoiceId: String,
      amount: Number,
      status: String,
      paidAt: Date,
      invoiceUrl: String
    }
  ],
  cancellationReason: {
    type: String
  },
  cancellationDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Create index for efficient querying
SubscriptionSchema.index({ provider: 1, status: 1 });

// Method to check if subscription is active
SubscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && this.endDate > new Date();
};

// Method to check if subscription is about to expire (within 7 days)
SubscriptionSchema.methods.isAboutToExpire = function() {
  if (this.status !== 'active') return false;
  
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return this.endDate <= sevenDaysFromNow && this.endDate > now;
};

module.exports = mongoose.model('Subscription', SubscriptionSchema);