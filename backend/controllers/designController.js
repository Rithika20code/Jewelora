
const mongoose = require('mongoose');
const Design = require('../models/Design');

function getUserId(req) {
  return req.user?._id || req.user?.id;
}

// POST /api/designs/generate
async function generateDesign(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to save your design.',
      });
    }

    const {
      imageBase64,
      jewelryType,
      size,
      style,
      material,
      purity,
      metalColor,
      gemstone = '',
      carat = 0,
      estimatedWeight,
      complexity,
      budget,
      description = '',
      priceEstimate = null,
    } = req.body;

    const requiredFields = {
      imageBase64,
      jewelryType,
      size,
      style,
      material,
      purity,
      metalColor,
      complexity,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value || !String(value).trim())
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    if (
      !Number.isFinite(Number(estimatedWeight)) ||
      Number(estimatedWeight) <= 0 ||
      !Number.isFinite(Number(budget)) ||
      Number(budget) <= 0 ||
      !Number.isFinite(Number(carat)) ||
      Number(carat) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Weight, budget, or gemstone carat is invalid.',
      });
    }

    const design = await Design.create({
      user: userId,
      imageBase64,
      jewelryType,
      size,
      style,
      material,
      purity,
      metalColor,
      gemstone,
      carat: Number(carat),
      estimatedWeight: Number(estimatedWeight),
      complexity,
      budget: Number(budget),
      description,
      priceEstimate,
    });

    return res.status(201).json({
      success: true,
      message: 'Design saved successfully.',
      design,
    });
  } catch (error) {
    console.error('generateDesign error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to save the design.',
    });
  }
}

// GET /api/designs
async function getMyDesigns(req, res) {
  try {
    const userId = getUserId(req);

    const designs = await Design.find({ user: userId })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: designs.length,
      designs,
    });
  } catch (error) {
    console.error('getMyDesigns error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to load your designs.',
    });
  }
}

// GET /api/designs/favorites
async function getFavoriteDesigns(req, res) {
  try {
    const userId = getUserId(req);

    const designs = await Design.find({
      user: userId,
      isFavorite: true,
    }).sort({ updatedAt: -1 });

    return res.json({
      success: true,
      count: designs.length,
      designs,
    });
  } catch (error) {
    console.error('getFavoriteDesigns error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to load your favorites.',
    });
  }
}

// PATCH /api/designs/:id/favorite
async function toggleFavorite(req, res) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid design ID.',
      });
    }

    const design = await Design.findOne({
      _id: id,
      user: userId,
    });

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found.',
      });
    }

    design.isFavorite = !design.isFavorite;
    await design.save();

    return res.json({
      success: true,
      message: design.isFavorite
        ? 'Added to Favorites.'
        : 'Removed from Favorites.',
      design,
    });
  } catch (error) {
    console.error('toggleFavorite error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to update Favorites.',
    });
  }
}

// DELETE /api/designs/:id
async function deleteDesign(req, res) {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid design ID.',
      });
    }

    const design = await Design.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Design deleted successfully.',
    });
  } catch (error) {
    console.error('deleteDesign error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to delete the design.',
    });
  }
}

module.exports = {
  generateDesign,
  getMyDesigns,
  getFavoriteDesigns,
  toggleFavorite,
  deleteDesign,
};
