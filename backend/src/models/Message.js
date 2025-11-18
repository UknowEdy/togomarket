const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Conversation
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },

  // Expéditeur
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Contenu
  content: {
    text: {
      type: String,
      trim: true,
      maxlength: [1000, 'Le message ne peut pas dépasser 1000 caractères']
    },
    images: [{
      url: String,
      publicId: String
    }]
  },

  // Offre de prix (pour négociation)
  priceOffer: {
    amount: Number,
    currency: {
      type: String,
      default: 'FCFA'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'countered'],
      default: 'pending'
    }
  },

  // Statut
  isRead: {
    type: Boolean,
    default: false
  },

  readAt: Date,

  isDeleted: {
    type: Boolean,
    default: false
  },

  // Type de message
  type: {
    type: String,
    enum: ['text', 'image', 'offer', 'system'],
    default: 'text'
  }

}, {
  timestamps: true
});

// Index pour optimisation
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
