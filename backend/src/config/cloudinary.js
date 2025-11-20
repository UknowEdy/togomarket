const cloudinary = require('cloudinary').v2;

// Configuration Cloudinary (optionnelle)
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const uploadImage = async (imagePath, folder = 'togomarket') => {
  // Si Cloudinary n'est pas configuré, retourne une URL placeholder
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.log('⚠️ Cloudinary non configuré, image ignorée');
    return {
      url: 'https://via.placeholder.com/400x300?text=Image',
      publicId: 'placeholder_' + Date.now()
    };
  }

  const result = await cloudinary.uploader.upload(imagePath, {
    folder,
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  });
  
  return { url: result.secure_url, publicId: result.public_id };
};

const deleteImage = async (publicId) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return;
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadImage, deleteImage };
