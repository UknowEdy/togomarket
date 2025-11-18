const Listing = require('../models/Listing');
const User = require('../models/User');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const fs = require('fs').promises;

/**
 * @desc    Créer une nouvelle annonce
 * @route   POST /api/listings
 * @access  Private (Verified)
 */
exports.createListing = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      price,
      isNegotiable,
      isFree,
      condition,
      city,
      district,
      isUrgent
    } = req.body;

    // Ajouter le vendeur
    req.body.seller = req.user.id;
    req.body.location = { city, district };

    // Upload des images si présentes
    if (req.files && req.files.length > 0) {
      const imageUploads = req.files.map(async (file, index) => {
        const result = await uploadImage(file.path, 'togomarket/listings');
        // Supprimer le fichier local après upload
        await fs.unlink(file.path);
        return {
          url: result.url,
          publicId: result.publicId,
          isPrimary: index === 0
        };
      });

      req.body.images = await Promise.all(imageUploads);
    }

    const listing = await Listing.create(req.body);

    // Incrémenter le compteur d'annonces de l'utilisateur
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalListings: 1, activeListings: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Annonce créée avec succès',
      listing
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir toutes les annonces actives (avec filtres)
 * @route   GET /api/listings
 * @access  Public
 */
exports.getListings = async (req, res, next) => {
  try {
    const {
      category,
      city,
      minPrice,
      maxPrice,
      condition,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    // Construire le filtre
    const filter = {
      status: 'active',
      expiresAt: { $gt: new Date() }
    };

    if (category) filter.category = category;
    if (city) filter['location.city'] = city;
    if (condition) filter.condition = condition;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Requête avec population
    const listings = await Listing.find(filter)
      .populate('seller', 'fullName avatar rating city badges isFullyVerified')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Compteur total
    const total = await Listing.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: listings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      listings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir une annonce par ID
 * @route   GET /api/listings/:id
 * @access  Public
 */
exports.getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'fullName avatar rating city badges isFullyVerified memberSince phone');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Annonce introuvable'
      });
    }

    // Incrémenter les vues (si pas le propriétaire)
    if (!req.user || listing.seller._id.toString() !== req.user.id) {
      await listing.incrementViews();
    }

    res.status(200).json({
      success: true,
      listing
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mettre à jour une annonce
 * @route   PUT /api/listings/:id
 * @access  Private (Owner)
 */
exports.updateListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Annonce introuvable'
      });
    }

    // Vérifier la propriété
    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    // Mettre à jour
    listing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Annonce mise à jour',
      listing
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Supprimer une annonce
 * @route   DELETE /api/listings/:id
 * @access  Private (Owner)
 */
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Annonce introuvable'
      });
    }

    // Vérifier la propriété
    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    // Supprimer les images de Cloudinary
    if (listing.images && listing.images.length > 0) {
      await Promise.all(
        listing.images.map(img => deleteImage(img.publicId))
      );
    }

    // Marquer comme supprimée
    listing.status = 'deleted';
    await listing.save();

    // Décrémenter le compteur
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { activeListings: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Annonce supprimée'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Marquer une annonce comme vendue
 * @route   PUT /api/listings/:id/mark-sold
 * @access  Private (Owner)
 */
exports.markAsSold = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Annonce introuvable'
      });
    }

    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    await listing.markAsSold();

    res.status(200).json({
      success: true,
      message: 'Annonce marquée comme vendue',
      listing
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir les annonces d'un utilisateur
 * @route   GET /api/listings/user/:userId
 * @access  Public
 */
exports.getUserListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({
      seller: req.params.userId,
      status: 'active'
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: listings.length,
      listings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir mes annonces
 * @route   GET /api/listings/my/all
 * @access  Private
 */
exports.getMyListings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { seller: req.user.id };

    if (status) filter.status = status;

    const listings = await Listing.find(filter).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: listings.length,
      listings
    });
  } catch (error) {
    next(error);
  }
};
