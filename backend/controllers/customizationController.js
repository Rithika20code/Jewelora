const mongoose = require('mongoose');
const Customization = require('../models/Customization');
const User = require('../models/User');
const Design = require('../models/Design');

// Create a new jewelry customization
const createCustomization = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Only customers can create customization requests.',
      });
    }

    const {
      jewelryType,
      size,
      style,
      material,
      purity,
      metalColor,
      gemstone,
      carat,
      estimatedWeight,
      complexity,
      budget,
      description,
      referenceImage,
    } = req.body;

    if (
      !jewelryType ||
      !size ||
      !style ||
      !material ||
      !purity ||
      !metalColor ||
      estimatedWeight === undefined ||
      !complexity ||
      budget === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required customization details.',
      });
    }

    const customization = await Customization.create({
      user: req.user._id,
      jewelryType,
      size,
      style,
      material,
      purity,
      metalColor,
      gemstone: gemstone || '',
      carat: carat || 0,
      estimatedWeight,
      complexity,
      budget,
      description: description || '',
      referenceImage: {
        fileName: referenceImage?.fileName || '',
        fileType: referenceImage?.fileType || '',
      },
      status: 'submitted',
    });

    return res.status(201).json({
      success: true,
      message: 'Jewelry customization saved successfully.',
      customization,
    });
  } catch (error) {
    console.error('Create customization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while saving customization.',
    });
  }
};

// List jewellers customers can assign a request to
const getAvailableJewellers = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Only customers can view available jewellers.',
      });
    }

    const jewellers = await User.find({ role: 'jeweller' })
      .select('_id name email')
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      jewellers,
    });
  } catch (error) {
    console.error('Get jewellers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve jewellers.',
    });
  }
};

// Attach the saved design and price estimate to the customer's request
const attachDesignToCustomization = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Only customers can update their customization design.',
      });
    }

    const { id } = req.params;
    const { designId, priceEstimate } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customization ID.',
      });
    }

    if (!mongoose.isValidObjectId(designId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid saved design ID is required.',
      });
    }

    const customization = await Customization.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!customization) {
      return res.status(404).json({
        success: false,
        message: 'Customization request not found.',
      });
    }

    const design = await Design.findOne({
      _id: designId,
      user: req.user._id,
    });

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Saved design not found for this account.',
      });
    }

    customization.design = design._id;
    customization.priceEstimate =
      priceEstimate ?? design.priceEstimate ?? null;
    customization.status = 'design_generated';

    await customization.save();

    return res.status(200).json({
      success: true,
      message: 'Generated design attached to customization.',
      customization,
    });
  } catch (error) {
    console.error('Attach design error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to attach design to customization.',
    });
  }
};

// Assign a customer's request to a jeweller
const assignCustomizationToJeweller = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Only customers can assign their requests.',
      });
    }

    const { id } = req.params;
    const { jewellerId } = req.body;

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(jewellerId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid customization and jeweller IDs are required.',
      });
    }

    const customization = await Customization.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!customization) {
      return res.status(404).json({
        success: false,
        message: 'Customization request not found.',
      });
    }

    if (!customization.design) {
      return res.status(400).json({
        success: false,
        message: 'Generate and save the design before assigning a jeweller.',
      });
    }

    const jeweller = await User.findOne({
      _id: jewellerId,
      role: 'jeweller',
    });

    if (!jeweller) {
      return res.status(404).json({
        success: false,
        message: 'Jeweller account not found.',
      });
    }

    if (customization.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed requests cannot be reassigned.',
      });
    }

    customization.assignedJeweller = jeweller._id;
    customization.status = 'submitted';

    await customization.save();

    return res.status(200).json({
      success: true,
      message: 'Request assigned to jeweller successfully.',
      customization,
    });
  } catch (error) {
    console.error('Assign jeweller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to assign request to jeweller.',
    });
  }
};

// List requests assigned to the logged-in jeweller
const getJewellerRequests = async (req, res) => {
  try {
    if (req.user.role !== 'jeweller') {
      return res.status(403).json({
        success: false,
        message: 'Only jewellers can view assigned requests.',
      });
    }

    const requests = await Customization.find({
      assignedJeweller: req.user._id,
    })
      .populate('user', 'name email')
      .populate('design')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error('Get jeweller requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve assigned requests.',
    });
  }
};

// Update status for a request assigned to this jeweller
const updateCustomizationStatus = async (req, res) => {
  try {
    if (req.user.role !== 'jeweller') {
      return res.status(403).json({
        success: false,
        message: 'Only jewellers can update request status.',
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      'reviewed',
      'accepted',
      'rejected',
      'in_progress',
      'ready',
      'completed',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value.',
      });
    }

    const customization = await Customization.findOne({
      _id: id,
      assignedJeweller: req.user._id,
    });

    if (!customization) {
      return res.status(404).json({
        success: false,
        message: 'Assigned customization request not found.',
      });
    }

    customization.status = status;
    await customization.save();

    return res.status(200).json({
      success: true,
      message: 'Customization status updated successfully.',
      customization,
    });
  } catch (error) {
    console.error('Update customization status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to update customization status.',
    });
  }
};

module.exports = {
  createCustomization,
  getAvailableJewellers,
  attachDesignToCustomization,
  assignCustomizationToJeweller,
  getJewellerRequests,
  updateCustomizationStatus,
};