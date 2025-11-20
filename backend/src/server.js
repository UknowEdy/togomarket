require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const connectDB = require('./config/database');
const { initSocket } = require('./config/socket');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Créer l'application Express
const app = express();
const server = http.createServer(app);

// Connexion à la base de données
connectDB();

// Initialiser Socket.io
initSocket(server);
console.log('✅ Socket.io initialized');

// Middlewares de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middlewares généraux
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger (seulement en développement)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api', generalLimiter);

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static('uploads'));

// Route de test
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🇹🇬 Bienvenue sur TogoMarket API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      listings: '/api/listings',
      categories: '/api/categories',
      users: '/api/users',
      messages: '/api/messages'
    }
  });
});

// Routes de l'API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));

// Gestionnaire d'erreurs 404
app.use(notFound);

// Gestionnaire d'erreurs global
app.use(errorHandler);

// Démarrage du serveur
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🇹🇬  TogoMarket API Server Started   ║
╠════════════════════════════════════════╣
║  Environment: ${process.env.NODE_ENV || 'development'}                  ║
║  Port: ${PORT}                            ║
║  URL: http://localhost:${PORT}            ║
║  Socket.io: ✅ Active                    ║
╚════════════════════════════════════════╝
  `);
});

// Gérer les erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error(`❌ Erreur: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM reçu. Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
  });
});

module.exports = app;
