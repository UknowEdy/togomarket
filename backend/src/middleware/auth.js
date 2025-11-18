const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware de protection des routes (authentification requise)
 */
exports.protect = async (req, res, next) => {
  let token;

  // Récupérer le token depuis le header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Vérifier si le token existe
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Accès non autorisé. Veuillez vous connecter.'
    });
  }

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur (sans le mot de passe)
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    // Vérifier si le compte est actif
    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Votre compte a été désactivé'
      });
    }

    // Vérifier si le compte est banni
    if (req.user.isBanned) {
      return res.status(403).json({
        success: false,
        message: `Votre compte a été banni. Raison: ${req.user.banReason || 'Non spécifié'}`
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur est vérifié
 */
exports.requireVerified = (req, res, next) => {
  if (!req.user.isPhoneVerified) {
    return res.status(403).json({
      success: false,
      message: 'Vous devez vérifier votre numéro de téléphone pour effectuer cette action'
    });
  }
  next();
};

/**
 * Middleware pour vérifier si l'utilisateur est admin
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès interdit'
      });
    }
    next();
  };
};

/**
 * Génère un token JWT
 */
exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

/**
 * Envoie le token dans la réponse
 */
exports.sendTokenResponse = (user, statusCode, res, message = 'Succès') => {
  const token = exports.generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: user.getPublicProfile()
  });
};
