const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Listing = require('../models/Listing');
const { emitNewMessage, notifyUser } = require('../config/socket');

/**
 * @desc    Créer ou obtenir une conversation
 * @route   POST /api/messages/conversation
 * @access  Private
 */
exports.getOrCreateConversation = async (req, res, next) => {
  try {
    const { listingId } = req.body;
    const buyerId = req.user.id;

    // Trouver l'annonce
    const listing = await Listing.findById(listingId).populate('seller');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Annonce introuvable'
      });
    }

    const sellerId = listing.seller._id;

    // Ne pas créer de conversation si l'utilisateur est le vendeur
    if (sellerId.toString() === buyerId) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas créer une conversation avec vous-même'
      });
    }

    // Chercher si une conversation existe déjà
    let conversation = await Conversation.findOne({
      buyer: buyerId,
      seller: sellerId,
      listing: listingId
    })
      .populate('buyer', 'fullName avatar phone')
      .populate('seller', 'fullName avatar phone rating badges')
      .populate('listing', 'title price images status');

    // Si elle n'existe pas, la créer
    if (!conversation) {
      conversation = await Conversation.create({
        buyer: buyerId,
        seller: sellerId,
        listing: listingId
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('buyer', 'fullName avatar phone')
        .populate('seller', 'fullName avatar phone rating badges')
        .populate('listing', 'title price images status');
    }

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir toutes les conversations d'un utilisateur
 * @route   GET /api/messages/conversations
 * @access  Private
 */
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      $or: [{ buyer: userId }, { seller: userId }],
      status: 'active'
    })
      .populate('buyer', 'fullName avatar phone')
      .populate('seller', 'fullName avatar phone rating badges')
      .populate('listing', 'title price images status')
      .sort('-updatedAt');

    // Pour chaque conversation, ajouter le nombre de messages non lus
    const conversationsWithUnread = conversations.map(conv => {
      const isBuyer = conv.buyer._id.toString() === userId;
      const unreadCount = isBuyer ? conv.unreadCount.buyer : conv.unreadCount.seller;

      return {
        ...conv.toObject(),
        unreadCount,
        otherUser: isBuyer ? conv.seller : conv.buyer
      };
    });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations: conversationsWithUnread
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir les messages d'une conversation
 * @route   GET /api/messages/conversation/:conversationId
 * @access  Private
 */
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation introuvable'
      });
    }

    if (
      conversation.buyer.toString() !== userId &&
      conversation.seller.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Accès interdit'
      });
    }

    // Récupérer les messages
    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false
    })
      .populate('sender', 'fullName avatar')
      .sort('createdAt');

    // Marquer les messages comme lus
    const role = conversation.buyer.toString() === userId ? 'buyer' : 'seller';
    await conversation.resetUnread(role);

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Envoyer un message
 * @route   POST /api/messages/send
 * @access  Private
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text, priceOffer } = req.body;
    const senderId = req.user.id;

    // Vérifier la conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation introuvable'
      });
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    if (
      conversation.buyer.toString() !== senderId &&
      conversation.seller.toString() !== senderId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Accès interdit'
      });
    }

    // Créer le message
    const messageData = {
      conversation: conversationId,
      sender: senderId,
      type: priceOffer ? 'offer' : 'text'
    };

    if (text) {
      messageData.content = { text };
    }

    if (priceOffer) {
      messageData.priceOffer = {
        amount: priceOffer.amount,
        currency: priceOffer.currency || 'FCFA',
        status: 'pending'
      };
    }

    const message = await Message.create(messageData);

    // Peupler le message
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'fullName avatar');

    // Mettre à jour la conversation
    conversation.lastMessage = {
      content: text || `Offre: ${priceOffer?.amount} FCFA`,
      sender: senderId,
      createdAt: new Date()
    };

    // Incrémenter les non-lus pour le destinataire
    const recipientRole = conversation.buyer.toString() === senderId ? 'seller' : 'buyer';
    await conversation.incrementUnread(recipientRole);

    await conversation.save();

    // Émettre le message via Socket.io
    emitNewMessage(conversationId, populatedMessage);

    // Notifier le destinataire
    const recipientId = conversation.buyer.toString() === senderId
      ? conversation.seller
      : conversation.buyer;

    notifyUser(recipientId, 'notification:new-message', {
      conversationId,
      message: populatedMessage
    });

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Répondre à une offre de prix
 * @route   PUT /api/messages/:messageId/respond-offer
 * @access  Private
 */
exports.respondToOffer = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { action, counterAmount } = req.body; // action: 'accept', 'reject', 'counter'
    const userId = req.user.id;

    const message = await Message.findById(messageId).populate({
      path: 'conversation',
      populate: { path: 'seller listing' }
    });

    if (!message || message.type !== 'offer') {
      return res.status(404).json({
        success: false,
        message: 'Offre introuvable'
      });
    }

    // Vérifier que l'utilisateur est le vendeur
    if (message.conversation.seller._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Seul le vendeur peut répondre à une offre'
      });
    }

    if (action === 'accept') {
      message.priceOffer.status = 'accepted';
      await message.save();

      res.status(200).json({
        success: true,
        message: 'Offre acceptée'
      });
    } else if (action === 'reject') {
      message.priceOffer.status = 'rejected';
      await message.save();

      res.status(200).json({
        success: true,
        message: 'Offre refusée'
      });
    } else if (action === 'counter' && counterAmount) {
      message.priceOffer.status = 'countered';
      await message.save();

      // Créer un nouveau message avec la contre-offre
      const counterMessage = await Message.create({
        conversation: message.conversation._id,
        sender: userId,
        type: 'offer',
        priceOffer: {
          amount: counterAmount,
          currency: 'FCFA',
          status: 'pending'
        }
      });

      const populated = await Message.findById(counterMessage._id)
        .populate('sender', 'fullName avatar');

      emitNewMessage(message.conversation._id, populated);

      res.status(201).json({
        success: true,
        message: 'Contre-offre envoyée',
        counterMessage: populated
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Action invalide'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Supprimer une conversation
 * @route   DELETE /api/messages/conversation/:conversationId
 * @access  Private
 */
exports.deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation introuvable'
      });
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    if (
      conversation.buyer.toString() !== userId &&
      conversation.seller.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Accès interdit'
      });
    }

    conversation.status = 'archived';
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Conversation supprimée'
    });
  } catch (error) {
    next(error);
  }
};
