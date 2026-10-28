const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema(
  {
    // Customer who created this customization
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Jeweller assigned to this request
    assignedJeweller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Link to the generated and saved design
    design: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design',
      default: null,
    },

    // Estimated price details
    priceEstimate: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Basic jewelry details
    jewelryType: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: String,
      required: true,
      trim: true,
    },

    style: {
      type: String,
      required: true,
      trim: true,
    },

    complexity: {
      type: String,
      required: true,
      trim: true,
    },

    // Material details
    material: {
      type: String,
      required: true,
      trim: true,
    },

    purity: {
      type: String,
      required: true,
      trim: true,
    },

    metalColor: {
      type: String,
      required: true,
      trim: true,
    },

    estimatedWeight: {
      type: Number,
      required: true,
      min: 0,
    },

    // Gemstone details
    gemstone: {
      type: String,
      default: '',
      trim: true,
    },

    carat: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Budget
    budget: {
      type: Number,
      required: true,
      min: 0,
    },

    // Customer description
    description: {
      type: String,
      default: '',
      trim: true,
    },

    // Reference image information
    referenceImage: {
      fileName: {
        type: String,
        default: '',
      },
      fileType: {
        type: String,
        default: '',
      },
    },

    // Request workflow status
    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'design_generated',
        'reviewed',
        'accepted',
        'rejected',
        'in_progress',
        'ready',
        'completed',
      ],
      default: 'submitted',
    },
  },
  {
    timestamps: true,
  }
);

const Customization = mongoose.model(
  'Customization',
  customizationSchema
);

module.exports = Customization;