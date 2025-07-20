const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a community name'],
    trim: true,
    maxlength: [100, 'Community name cannot be more than 100 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please add a street address']
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
      default: 'Bengaluru'
    },
    state: {
      type: String,
      required: [true, 'Please add a state'],
      default: 'Karnataka'
    },
    postalCode: {
      type: String,
      required: [true, 'Please add a postal code']
    }
  },
  type: {
    type: String,
    enum: ['apartment', 'gated community', 'neighborhood'],
    required: [true, 'Please specify the community type']
  },
  buildings: {
    type: [String],
    required: [true, 'Please add at least one building/block']
  },
  adminUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  amenities: {
    type: [String]
  },
  totalUnits: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create a geospatial index for future location-based queries
CommunitySchema.index({ 'address.location': '2dsphere' });

module.exports = mongoose.model('Community', CommunitySchema);