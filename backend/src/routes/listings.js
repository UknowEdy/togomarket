const express = require('express');
const router = express.Router();
const {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  markAsSold,
  getUserListings,
  getMyListings
} = require('../controllers/listingController');
const { protect, requireVerified } = require('../middleware/auth');
const { uploadMultiple, handleMulterError } = require('../middleware/upload');
const { listingLimiter } = require('../middleware/rateLimiter');

// Routes publiques
router.get('/', getListings);
router.get('/user/:userId', getUserListings);
router.get('/:id', getListing);

// Routes protégées
router.post(
  '/',
  protect,
  requireVerified,
  listingLimiter,
  uploadMultiple,
  handleMulterError,
  createListing
);

router.get('/my/all', protect, getMyListings);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);
router.put('/:id/mark-sold', protect, markAsSold);

module.exports = router;
