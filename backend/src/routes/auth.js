const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyPhone,
  resendCode,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter, verificationLimiter } = require('../middleware/rateLimiter');

// Routes publiques
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Routes protégées
router.post('/verify-phone', protect, verificationLimiter, verifyPhone);
router.post('/resend-code', protect, verificationLimiter, resendCode);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
