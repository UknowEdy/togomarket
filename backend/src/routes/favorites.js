const express = require('express');
const router = express.Router();
const {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(protect);

router.get('/', getFavorites);
router.get('/check/:listingId', checkFavorite);
router.post('/:listingId', addFavorite);
router.delete('/:listingId', removeFavorite);

module.exports = router;
