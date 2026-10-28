
const mongoose = require('mongoose');

const designSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    imageBase64: {
      type: String,
      required: true,
    },

    jewelryType: { type: String, required: true },
    size: { type: String, required: true },
    style: { type: String, required: true },
    material: { type: String, required: true },
    purity: { type: String, required: true },
    metalColor: { type: String, required: true },

    gemstone: { type: String, default: '' },
    carat: { type: Number, default: 0 },
    estimatedWeight: { type: Number, required: true },
    complexity: { type: String, required: true },
    budget: { type: Number, required: true },
    description: { type: String, default: '' },

    priceEstimate: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Design ||
  mongoose.model('Design', designSchema);
