const User = require('../models/User');
const { generateToken, sendTokenResponse } = require('../middleware/auth');

/**
 * @desc    Inscription d'un nouvel utilisateur
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { fullName, phone, email, password, city } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ce numéro de téléphone est déjà utilisé'
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      fullName,
      phone,
      email,
      password,
      city
    });

    // Générer et envoyer le code de vérification SMS
    const verificationCode = user.generatePhoneVerificationCode();
    await user.save({ validateBeforeSave: false });

    // TODO: Envoyer le code par SMS (intégration Twilio)
    console.log(`📱 Code de vérification pour ${phone}: ${verificationCode}`);

    sendTokenResponse(user, 201, res, 'Inscription réussie. Vérifiez votre téléphone.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Connexion d'un utilisateur
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { phoneOrEmail, password } = req.body;

    // Validation
    if (!phoneOrEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un téléphone/email et un mot de passe'
      });
    }

    // Trouver l'utilisateur (avec le mot de passe)
    const user = await User.findOne({
      $or: [
        { phone: phoneOrEmail },
        { email: phoneOrEmail }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects'
      });
    }

    // Vérifier le mot de passe
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects'
      });
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Connexion réussie');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Vérifier le code SMS
 * @route   POST /api/auth/verify-phone
 * @access  Private
 */
exports.verifyPhone = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.phoneVerificationCode || !user.phoneVerificationExpires) {
      return res.status(400).json({
        success: false,
        message: 'Aucun code de vérification en attente'
      });
    }

    // Vérifier l'expiration
    if (user.phoneVerificationExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Le code a expiré. Demandez-en un nouveau.'
      });
    }

    // Vérifier le code
    if (user.phoneVerificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Code de vérification invalide'
      });
    }

    // Marquer comme vérifié
    user.isPhoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Téléphone vérifié avec succès',
      user: user.getPublicProfile()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Renvoyer le code de vérification
 * @route   POST /api/auth/resend-code
 * @access  Private
 */
exports.resendCode = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Votre téléphone est déjà vérifié'
      });
    }

    const verificationCode = user.generatePhoneVerificationCode();
    await user.save({ validateBeforeSave: false });

    // TODO: Envoyer le code par SMS
    console.log(`📱 Nouveau code pour ${user.phone}: ${verificationCode}`);

    res.status(200).json({
      success: true,
      message: 'Nouveau code envoyé'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir le profil de l'utilisateur connecté
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mettre à jour le profil
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      fullName: req.body.fullName,
      email: req.body.email,
      city: req.body.city,
      district: req.body.district,
      bio: req.body.bio
    };

    // Supprimer les champs undefined
    Object.keys(fieldsToUpdate).forEach(key =>
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour',
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Changer le mot de passe
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Vérifier le mot de passe actuel
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Mot de passe modifié avec succès');
  } catch (error) {
    next(error);
  }
};
