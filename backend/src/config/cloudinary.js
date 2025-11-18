const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload une image vers Cloudinary avec compression
 */
const uploadImage = async (filePath, folder = 'togomarket') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      quality: 'auto:good',
      fetch_format: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    throw new Error(`Erreur upload Cloudinary: ${error.message}`);
  }
};

/**
 * Supprime une image de Cloudinary
 */
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Erreur suppression Cloudinary:', error.message);
  }
};

module.exports = {
  uploadImage,
  deleteImage
};
