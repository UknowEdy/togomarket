const User = require('../models/User');
const Listing = require('../models/Listing');
const Review = require('../models/Review');

/**
 * Dashboard - Statistiques globales
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalListings,
      activeListings,
      pendingListings,
      totalReviews,
      bannedUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true, isBanned: false }),
      Listing.countDocuments(),
      Listing.countDocuments({ status: 'active' }),
      Listing.countDocuments({ status: 'pending' }),
      Review.countDocuments(),
      User.countDocuments({ isBanned: true })
    ]);

    // Statistiques des derniers 30 jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const newListings = await Listing.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          banned: bannedUsers,
          new30Days: newUsers
        },
        listings: {
          total: totalListings,
          active: activeListings,
          pending: pendingListings,
          new30Days: newListings
        },
        reviews: {
          total: totalReviews
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

/**
 * Gestion des utilisateurs
 */

// Obtenir tous les utilisateurs avec filtres
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      city,
      isVerified,
      isBanned,
      search
    } = req.query;

    const query = {};

    if (role) query.role = role;
    if (city) query.city = city;
    if (isBanned !== undefined) query.isBanned = isBanned === 'true';
    if (isVerified !== undefined) query.isPhoneVerified = isVerified === 'true';

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// Obtenir un utilisateur spécifique
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    // Récupérer les annonces de l'utilisateur
    const listings = await Listing.find({ seller: user._id })
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      user,
      listings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
};

// Bannir/Débannir un utilisateur
exports.banUser = async (req, res) => {
  try {
    const { banReason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    // Ne pas pouvoir bannir un admin
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Impossible de bannir un administrateur'
      });
    }

    user.isBanned = !user.isBanned;
    user.banReason = user.isBanned ? banReason : null;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBanned ? 'Utilisateur banni' : 'Utilisateur débanni',
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du bannissement',
      error: error.message
    });
  }
};

// Vérifier l'identité d'un utilisateur
exports.verifyIdentity = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' ou 'rejected'
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    if (!user.identityDocument || !user.identityDocument.url) {
      return res.status(400).json({
        success: false,
        message: 'Aucun document d\'identité soumis'
      });
    }

    user.identityDocument.status = status;
    user.isIdentityVerified = status === 'approved';

    if (status === 'approved') {
      // Ajouter le badge verified
      if (!user.badges.includes('verified')) {
        user.badges.push('verified');
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Document ${status === 'approved' ? 'approuvé' : 'rejeté'}`,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification',
      error: error.message
    });
  }
};

// Changer le rôle d'un utilisateur
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    // Seul un admin peut promouvoir quelqu'un admin
    if (role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Seul un admin peut créer un autre admin'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Rôle mis à jour vers ${role}`,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du rôle',
      error: error.message
    });
  }
};

/**
 * Gestion des annonces
 */

// Obtenir toutes les annonces avec filtres
exports.getAllListings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      city,
      search
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (city) query.city = city;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .populate('seller', 'fullName phone avatar city')
        .populate('category', 'name icon')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Listing.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des annonces',
      error: error.message
    });
  }
};

// Approuver/Rejeter une annonce
exports.moderateListing = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status invalide'
      });
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Annonce introuvable'
      });
    }

    listing.status = status;
    if (status === 'rejected') {
      listing.rejectionReason = rejectionReason;
    }
    await listing.save();

    res.status(200).json({
      success: true,
      message: `Annonce ${status === 'active' ? 'approuvée' : 'rejetée'}`,
      listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modération',
      error: error.message
    });
  }
};

// Supprimer une annonce
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Annonce introuvable'
      });
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Annonce supprimée'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

/**
 * Gestion des avis
 */

// Obtenir tous les avis signalés
exports.getReportedReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ isReported: true })
        .populate('reviewer', 'fullName avatar')
        .populate('reviewee', 'fullName avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ isReported: true })
    ]);

    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis',
      error: error.message
    });
  }
};

// Supprimer un avis
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis introuvable'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Avis supprimé'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};
