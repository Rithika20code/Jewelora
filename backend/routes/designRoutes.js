
const express = require('express');
const {
  generateDesign,
  getMyDesigns,
  getFavoriteDesigns,
  toggleFavorite,
  deleteDesign,
} = require('../controllers/designController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All design endpoints require login.
router.use(protect);

router.get('/favorites', getFavoriteDesigns);
router.get('/', getMyDesigns);
router.post('/generate', generateDesign);
router.patch('/:id/favorite', toggleFavorite);
router.delete('/:id', deleteDesign);

module.exports = router;
