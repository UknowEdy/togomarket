/**
 * Gestionnaire d'erreurs global
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log pour le développement
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  // Erreur Mongoose - ID invalide
  if (err.name === 'CastError') {
    const message = 'Ressource introuvable';
    error = { statusCode: 404, message };
  }

  // Erreur Mongoose - Doublon (clé unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Ce ${field} existe déjà`;
    error = { statusCode: 400, message };
  }

  // Erreur Mongoose - Validation
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { statusCode: 400, message };
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide';
    error = { statusCode: 401, message };
  }

  // Token expiré
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expiré';
    error = { statusCode: 401, message };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Gestionnaire pour routes non trouvées
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
