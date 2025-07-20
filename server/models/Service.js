const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a service title'],
    trim: true,
    maxlength: [100, 'Service title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a service provider']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    required: [true, 'Please add a service category']
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory'
  },
  tags: {
    type: [String],
    required: [true, 'Please add at least one tag']
  },
  priceInfo: {
    type: String,
    required: [true, 'Please add pricing information']
  },
  availability: {
    type: String,
    required: [true, 'Please specify availability']
  },
  images: [
    {
      type: String
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: [true, 'Please specify the community']
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with reviews
ServiceSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'service',
  justOne: false
});

// Create compound index for efficient querying
ServiceSchema.index({ community: 1, category: 1, isActive: 1 });

module.exports = mongoose.model('Service', ServiceSchema);