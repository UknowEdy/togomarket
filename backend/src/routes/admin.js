const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  banUser,
  verifyIdentity,
  updateUserRole,
  getAllListings,
  moderateListing,
  deleteListing,
  getReportedReviews,
  deleteReview
} = require('../controllers/adminController');
const { protect, authorize, isStaff, isAdmin, isSuperAdmin } = require('../middleware/auth');

// Toutes les routes admin nécessitent authentication + rôle staff minimum
router.use(protect);
router.use(isStaff);

/**
 * Dashboard & Statistiques
 */
router.get('/dashboard/stats', getDashboardStats);

/**
 * Gestion des utilisateurs
 */
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/verify-identity', verifyIdentity);

// Seuls les superadmins peuvent changer les rôles
router.put('/users/:id/role', isSuperAdmin, updateUserRole);

/**
 * Gestion des annonces
 */
router.get('/listings', getAllListings);
router.put('/listings/:id/moderate', moderateListing);
router.delete('/listings/:id', deleteListing);

/**
 * Gestion des avis
 */
router.get('/reviews/reported', getReportedReviews);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
