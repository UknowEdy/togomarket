const Review = require('../models/Review');
const Listing = require('../models/Listing');
const User = require('../models/User');

/**
 * @desc    Créer une évaluation
 * @route   POST /api/reviews
 * @access  Private
 */
exports.createReview = async (req, res, next) => {
  try {
    const {
      listingId,
      revieweeId,
      rating,
      comment,
      criteria,
      transactionType
    } = req.body;
    const reviewerId = req.user.id;

    // Vérifier que l'annonce existe
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Annonce introuvable'
      });
    }

    // Vérifier que l'utilisateur ne s'évalue pas lui-même
    if (revieweeId === reviewerId) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas vous évaluer vous-même'
      });
    }

    // Vérifier si une évaluation existe déjà
    const existingReview = await Review.findOne({
      reviewer: reviewerId,
      listing: listingId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà évalué cette transaction'
      });
    }

    // Créer l'évaluation
    const review = await Review.create({
      listing: listingId,
      reviewer: reviewerId,
      reviewee: revieweeId,
      rating,
      comment,
      criteria,
      transactionType
    });

    res.status(201).json({
      success: true,
      message: 'Évaluation créée avec succès',
      review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir les évaluations d'un utilisateur
 * @route   GET /api/reviews/user/:userId
 * @access  Public
 */
exports.getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({
      reviewee: userId,
      isApproved: true
    })
      .populate('reviewer', 'fullName avatar')
      .populate('listing', 'title category')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Review.countDocuments({
      reviewee: userId,
      isApproved: true
    });

    // Calculer les statistiques
    const stats = await Review.aggregate([
      { $match: { reviewee: userId, isApproved: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          avgCommunication: { $avg: '$criteria.communication' },
          avgReliability: { $avg: '$criteria.reliability' },
          avgProductQuality: { $avg: '$criteria.productQuality' },
          total: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      stats: stats[0] || null,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir les évaluations données par un utilisateur
 * @route   GET /api/reviews/by-user/:userId
 * @access  Private
 */
exports.getReviewsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Vérifier que c'est bien l'utilisateur connecté
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès interdit'
      });
    }

    const reviews = await Review.find({ reviewer: userId })
      .populate('reviewee', 'fullName avatar')
      .populate('listing', 'title category')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Modifier une évaluation
 * @route   PUT /api/reviews/:reviewId
 * @access  Private
 */
exports.updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, criteria } = req.body;
    const userId = req.user.id;

    let review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation introuvable'
      });
    }

    // Vérifier que c'est bien l'auteur
    if (review.reviewer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que vos propres évaluations'
      });
    }

    // Mettre à jour
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.criteria = criteria || review.criteria;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Évaluation mise à jour',
      review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Supprimer une évaluation
 * @route   DELETE /api/reviews/:reviewId
 * @access  Private
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation introuvable'
      });
    }

    // Vérifier que c'est bien l'auteur
    if (review.reviewer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres évaluations'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Évaluation supprimée'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Signaler une évaluation
 * @route   PUT /api/reviews/:reviewId/report
 * @access  Private
 */
exports.reportReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation introuvable'
      });
    }

    review.isReported = true;
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Évaluation signalée. Elle sera examinée par l\'équipe de modération.'
    });
  } catch (error) {
    next(error);
  }
};
