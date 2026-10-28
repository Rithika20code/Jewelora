const express = require('express');

const {
  createCustomization,
  getAvailableJewellers,
  attachDesignToCustomization,
  assignCustomizationToJeweller,
  getJewellerRequests,
  updateCustomizationStatus,
} = require('../controllers/customizationController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All customization routes require authentication
router.use(protect);

// Customer: create a customization request
router.post('/', createCustomization);

// Customer: list available jewellers
router.get('/jewellers', getAvailableJewellers);

// Jeweller: view requests assigned to their account
router.get('/jeweller/requests', getJewellerRequests);

// Customer: attach generated design and price estimate
router.patch('/:id/design', attachDesignToCustomization);

// Customer: assign their request to a jeweller
router.patch('/:id/assign', assignCustomizationToJeweller);

// Jeweller: update status of an assigned request
router.patch('/:id/status', updateCustomizationStatus);

module.exports = router;