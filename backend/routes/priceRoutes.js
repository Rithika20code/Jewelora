const express = require('express');

const {
  estimatePrice,
} = require('../controllers/priceController');

const {
  protect,
} = require('../middleware/authMiddleware');

const router = express.Router();

console.log('PRICE ROUTES LOADED');

router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Price routes are working!',
  });
});

router.post(
  '/estimate',
  protect,
  estimatePrice
);

module.exports = router;