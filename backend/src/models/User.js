const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Informations de base
  fullName: {
    type: String,
    required: [true, 'Le nom complet est requis'],
    trim: true,
    minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },

  phone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
    unique: true,
    match: [/^(\+228)?[0-9]{8}$/, 'Numéro de téléphone togolais invalide']
  },

  email: {
    type: String,
    sparse: true, // Permet null mais unique si présent
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },

  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Ne pas retourner le password par défaut
  },

  // Localisation
  city: {
    type: String,
    required: [true, 'La ville est requise'],
    enum: ['Lomé', 'Kara', 'Sokodé', 'Kpalimé', 'Atakpamé', 'Bassar', 'Tsévié', 'Aného', 'Dapaong', 'Tchamba', 'Autre']
  },

  district: {
    type: String,
    trim: true
  },

  // Profil
  avatar: {
    url: String,
    publicId: String // Pour Cloudinary
  },

  bio: {
    type: String,
    maxlength: [500, 'La bio ne peut pas dépasser 500 caractères']
  },

  // Vérifications
  isPhoneVerified: {
    type: Boolean,
    default: false
  },

  isEmailVerified: {
    type: Boolean,
    default: false
  },

  isIdentityVerified: {
    type: Boolean,
    default: false
  },

  identityDocument: {
    url: String,
    publicId: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },

  // Vérification codes
  phoneVerificationCode: String,
  phoneVerificationExpires: Date,
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Statistiques
  totalListings: {
    type: Number,
    default: 0
  },

  activeListings: {
    type: Number,
    default: 0
  },

  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },

  // Badges
  badges: [{
    type: String,
    enum: ['verified', 'top-seller', 'responsive', 'trusted']
  }],

  // Compte premium
  isPremium: {
    type: Boolean,
    default: false
  },

  premiumExpiresAt: Date,

  // Modération
  isActive: {
    type: Boolean,
    default: true
  },

  isBanned: {
    type: Boolean,
    default: false
  },

  banReason: String,

  warnings: {
    type: Number,
    default: 0
  },

  // Préférences
  preferences: {
    language: {
      type: String,
      enum: ['fr', 'en', 'ewe', 'kabye'],
      default: 'fr'
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },

  // Dates
  memberSince: {
    type: Date,
    default: Date.now
  },

  lastLogin: Date,

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour optimisation
userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });
userSchema.index({ city: 1 });
userSchema.index({ 'rating.average': -1 });

// Virtual pour vérification complète
userSchema.virtual('isFullyVerified').get(function() {
  return this.isPhoneVerified && this.isIdentityVerified;
});

// Hash password avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour générer code de vérification SMS
userSchema.methods.generatePhoneVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 chiffres
  this.phoneVerificationCode = code;
  this.phoneVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return code;
};

// Méthode pour obtenir le profil public
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    fullName: this.fullName,
    avatar: this.avatar,
    city: this.city,
    rating: this.rating,
    badges: this.badges,
    isFullyVerified: this.isFullyVerified,
    memberSince: this.memberSince,
    totalListings: this.totalListings,
    isPremium: this.isPremium
  };
};

module.exports = mongoose.model('User', userSchema);
