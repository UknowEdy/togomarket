const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  // Informations de base
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    minlength: [10, 'Le titre doit contenir au moins 10 caractères'],
    maxlength: [80, 'Le titre ne peut pas dépasser 80 caractères']
  },

  description: {
    type: String,
    required: [true, 'La description est requise'],
    minlength: [20, 'La description doit contenir au moins 20 caractères'],
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },

  // Catégorie
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: [
      'phones-tablets',
      'motorcycles',
      'cars',
      'real-estate',
      'fashion',
      'electronics',
      'furniture',
      'baby-kids',
      'sports',
      'jobs-services',
      'education',
      'pets',
      'other'
    ]
  },

  subcategory: {
    type: String,
    trim: true
  },

  // Prix
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix doit être positif']
  },

  currency: {
    type: String,
    default: 'FCFA',
    enum: ['FCFA', 'EUR', 'USD']
  },

  isNegotiable: {
    type: Boolean,
    default: true
  },

  isFree: {
    type: Boolean,
    default: false
  },

  // État du produit
  condition: {
    type: String,
    required: [true, "L'état du produit est requis"],
    enum: ['new', 'excellent', 'good', 'acceptable']
  },

  // Photos
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  // Localisation
  location: {
    city: {
      type: String,
      required: [true, 'La ville est requise'],
      enum: ['Lomé', 'Kara', 'Sokodé', 'Kpalimé', 'Atakpamé', 'Bassar', 'Tsévié', 'Aného', 'Dapaong', 'Tchamba', 'Autre']
    },
    district: {
      type: String,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Vendeur
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Contact
  contactInfo: {
    phone: String,
    whatsapp: String,
    showPhoneDirectly: {
      type: Boolean,
      default: false
    }
  },

  // Options premium
  isUrgent: {
    type: Boolean,
    default: false
  },

  isFeatured: {
    type: Boolean,
    default: false
  },

  featuredExpiresAt: Date,

  isTopAd: {
    type: Boolean,
    default: false
  },

  topAdExpiresAt: Date,

  boostedUntil: Date,

  // Statistiques
  views: {
    type: Number,
    default: 0
  },

  contactClicks: {
    type: Number,
    default: 0
  },

  favorites: {
    type: Number,
    default: 0
  },

  shares: {
    type: Number,
    default: 0
  },

  // Statut
  status: {
    type: String,
    enum: ['pending', 'active', 'sold', 'expired', 'rejected', 'deleted'],
    default: 'pending'
  },

  rejectionReason: String,

  // Durée
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours
    }
  },

  // Modération
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['fraud', 'misleading', 'inappropriate', 'spam', 'duplicate', 'other']
    },
    details: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  isReported: {
    type: Boolean,
    default: false
  },

  // Dates
  publishedAt: Date,
  soldAt: Date,

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour recherche et filtrage
listingSchema.index({ title: 'text', description: 'text' });
listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ 'location.city': 1, status: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ seller: 1, status: 1 });
listingSchema.index({ isFeatured: -1, createdAt: -1 });
listingSchema.index({ expiresAt: 1 });

// Virtual pour image principale
listingSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

// Virtual pour vérifier si l'annonce est active
listingSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.expiresAt > new Date();
});

// Virtual pour temps restant
listingSchema.virtual('daysRemaining').get(function() {
  const diff = this.expiresAt - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Méthode pour incrémenter les vues
listingSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save({ validateBeforeSave: false });
};

// Méthode pour marquer comme vendu
listingSchema.methods.markAsSold = async function() {
  this.status = 'sold';
  this.soldAt = new Date();
  await this.save();
};

// Hook avant sauvegarde pour publier automatiquement
listingSchema.pre('save', function(next) {
  if (this.isNew && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Méthode statique pour trouver les annonces actives
listingSchema.statics.findActive = function(filters = {}) {
  return this.find({
    ...filters,
    status: 'active',
    expiresAt: { $gt: new Date() }
  }).populate('seller', 'fullName avatar rating city badges isFullyVerified');
};

module.exports = mongoose.model('Listing', listingSchema);
