const Favorite = require('../models/Favorite');
const Listing = require('../models/Listing');

/**
 * @desc    Ajouter une annonce aux favoris
 * @route   POST /api/favorites/:listingId
 * @access  Private
 */
exports.addFavorite = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    // Vérifier que l'annonce existe
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Annonce introuvable'
      });
    }

    // Vérifier si déjà en favoris
    const existingFavorite = await Favorite.findOne({
      user: userId,
      listing: listingId
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Annonce déjà dans vos favoris'
      });
    }

    // Créer le favori
    const favorite = await Favorite.create({
      user: userId,
      listing: listingId
    });

    // Incrémenter le compteur de favoris sur l'annonce
    await Listing.findByIdAndUpdate(listingId, {
      $inc: { favorites: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Annonce ajoutée aux favoris',
      favorite
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Retirer une annonce des favoris
 * @route   DELETE /api/favorites/:listingId
 * @access  Private
 */
exports.removeFavorite = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOneAndDelete({
      user: userId,
      listing: listingId
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favori introuvable'
      });
    }

    // Décrémenter le compteur
    await Listing.findByIdAndUpdate(listingId, {
      $inc: { favorites: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Annonce retirée des favoris'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir tous les favoris de l'utilisateur
 * @route   GET /api/favorites
 * @access  Private
 */
exports.getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.find({ user: userId })
      .populate({
        path: 'listing',
        populate: {
          path: 'seller',
          select: 'fullName avatar rating city badges'
        }
      })
      .sort('-createdAt');

    // Filtrer les annonces supprimées
    const activeFavorites = favorites.filter(
      fav => fav.listing && fav.listing.status !== 'deleted'
    );

    res.status(200).json({
      success: true,
      count: activeFavorites.length,
      favorites: activeFavorites
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Vérifier si une annonce est dans les favoris
 * @route   GET /api/favorites/check/:listingId
 * @access  Private
 */
exports.checkFavorite = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOne({
      user: userId,
      listing: listingId
    });

    res.status(200).json({
      success: true,
      isFavorite: !!favorite
    });
  } catch (error) {
    next(error);
  }
};
