const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Transaction
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },

  // Parties concernées
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Évaluation
  rating: {
    type: Number,
    required: [true, 'La note est requise'],
    min: [1, 'La note minimale est 1'],
    max: [5, 'La note maximale est 5']
  },

  // Commentaire
  comment: {
    type: String,
    maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères']
  },

  // Critères spécifiques
  criteria: {
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    reliability: {
      type: Number,
      min: 1,
      max: 5
    },
    productQuality: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // Type de transaction
  transactionType: {
    type: String,
    enum: ['purchase', 'sale'],
    required: true
  },

  // Modération
  isApproved: {
    type: Boolean,
    default: true
  },

  isReported: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

// Un utilisateur ne peut évaluer qu'une fois par annonce
reviewSchema.index({ reviewer: 1, listing: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1, createdAt: -1 });

// Hook pour mettre à jour la note moyenne de l'utilisateur
reviewSchema.post('save', async function() {
  const User = mongoose.model('User');

  const stats = await this.constructor.aggregate([
    { $match: { reviewee: this.reviewee } },
    {
      $group: {
        _id: '$reviewee',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(this.reviewee, {
      'rating.average': Math.round(stats[0].avgRating * 10) / 10,
      'rating.count': stats[0].count
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
