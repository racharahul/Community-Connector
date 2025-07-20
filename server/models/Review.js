const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Please add a service']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a customer']
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add a review comment'],
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  providerResponse: {
    type: String,
    maxlength: [500, 'Response cannot be more than 500 characters']
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: {
    type: String,
    maxlength: [200, 'Report reason cannot be more than 200 characters']
  },
  isVerified: {
    type: Boolean,
    default: false,
    description: 'Indicates if the review is from a verified service user'
  },
  serviceDate: {
    type: Date,
    description: 'Date when the service was provided'
  },
  specificRatings: {
    type: Map,
    of: Number,
    description: 'Category-specific ratings (e.g., timeliness, quality, etc.)'
  }
}, {
  timestamps: true
});

// Prevent user from submitting more than one review per service
ReviewSchema.index({ service: 1, customer: 1 }, { unique: true });

// Static method to calculate average rating for a service
ReviewSchema.statics.getAverageRating = async function(serviceId) {
  const obj = await this.aggregate([
    {
      $match: { service: serviceId }
    },
    {
      $group: {
        _id: '$service',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj[0]) {
      await this.model('Service').findByIdAndUpdate(serviceId, {
        averageRating: obj[0].averageRating.toFixed(1),
        reviewCount: obj[0].reviewCount
      });
    } else {
      await this.model('Service').findByIdAndUpdate(serviceId, {
        averageRating: 0,
        reviewCount: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.service);
});

// Call getAverageRating after remove
ReviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.service);
});

module.exports = mongoose.model('Review', ReviewSchema);