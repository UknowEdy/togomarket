const rateLimit = require('express-rate-limit');

/**
 * Rate limiter général
 */
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Trop de requêtes. Veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter strict pour l'authentification
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
  }
});

/**
 * Rate limiter pour SMS/Email
 */
const verificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 codes max par heure
  message: {
    success: false,
    message: 'Trop de demandes de code de vérification. Réessayez dans 1 heure.'
  }
});

/**
 * Rate limiter pour création d'annonces
 */
const listingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 annonces max par heure
  message: {
    success: false,
    message: 'Limite de publication atteinte. Veuillez patienter 1 heure.'
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  verificationLimiter,
  listingLimiter
};
