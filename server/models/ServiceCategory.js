const mongoose = require('mongoose');

const ServiceCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    trim: true,
    maxlength: [50, 'Category name cannot be more than 50 characters'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    default: null
  },
  formFields: [
    {
      name: {
        type: String,
        required: true
      },
      label: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['text', 'textarea', 'select', 'multiselect', 'checkbox', 'radio', 'file', 'date'],
        required: true
      },
      options: [
        {
          label: String,
          value: String
        }
      ],
      required: {
        type: Boolean,
        default: false
      },
      placeholder: String,
      helpText: String
    }
  ],
  icon: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for subcategories
ServiceCategorySchema.virtual('subcategories', {
  ref: 'ServiceCategory',
  localField: '_id',
  foreignField: 'parentCategory',
  justOne: false
});

// Middleware to prevent deletion if category has subcategories or services
ServiceCategorySchema.pre('remove', async function(next) {
  // Check for subcategories
  const subcategories = await this.model('ServiceCategory').countDocuments({ parentCategory: this._id });
  if (subcategories > 0) {
    return next(new Error(`Cannot delete category with ${subcategories} subcategories`));
  }
  
  // Check for services using this category
  const services = await this.model('Service').countDocuments({ 
    $or: [{ category: this._id }, { subCategory: this._id }]
  });
  if (services > 0) {
    return next(new Error(`Cannot delete category with ${services} services`));
  }
  
  next();
});

module.exports = mongoose.model('ServiceCategory', ServiceCategorySchema);