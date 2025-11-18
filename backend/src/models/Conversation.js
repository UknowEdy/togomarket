const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  // Participants
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Annonce concernée
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },

  // Dernier message
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: Date
  },

  // Compteurs de messages non lus
  unreadCount: {
    buyer: {
      type: Number,
      default: 0
    },
    seller: {
      type: Number,
      default: 0
    }
  },

  // Statut
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active'
  },

  // Bloqué par
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true
});

// Index composé pour éviter les doublons
conversationSchema.index({ buyer: 1, seller: 1, listing: 1 }, { unique: true });
conversationSchema.index({ buyer: 1, updatedAt: -1 });
conversationSchema.index({ seller: 1, updatedAt: -1 });

// Méthode pour obtenir l'autre participant
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.buyer.toString() === userId.toString() ? this.seller : this.buyer;
};

// Méthode pour incrémenter les messages non lus
conversationSchema.methods.incrementUnread = async function(recipientRole) {
  if (recipientRole === 'buyer') {
    this.unreadCount.buyer += 1;
  } else {
    this.unreadCount.seller += 1;
  }
  await this.save();
};

// Méthode pour réinitialiser les messages non lus
conversationSchema.methods.resetUnread = async function(role) {
  if (role === 'buyer') {
    this.unreadCount.buyer = 0;
  } else {
    this.unreadCount.seller = 0;
  }
  await this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);
