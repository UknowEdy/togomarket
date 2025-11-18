const express = require('express');
const router = express.Router();
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  respondToOffer,
  deleteConversation
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes conversations
router.post('/conversation', getOrCreateConversation);
router.get('/conversations', getConversations);
router.get('/conversation/:conversationId', getMessages);
router.delete('/conversation/:conversationId', deleteConversation);

// Routes messages
router.post('/send', sendMessage);
router.put('/:messageId/respond-offer', respondToOffer);

module.exports = router;
