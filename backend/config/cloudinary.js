const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Helper function to upload image buffer to Cloudinary
const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      folder: 'manvue',
      quality: 'auto',
      fetch_format: 'auto'
    };

    cloudinary.uploader.upload_stream(
      { ...defaultOptions, ...options },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

// Helper function to delete image from Cloudinary
const deleteImage = (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

// Helper function to get optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto'
  };

  return cloudinary.url(publicId, { ...defaultOptions, ...options });
};

// Helper function to generate image transformations
const generateImageVariations = (publicId) => {
  const variations = {
    thumbnail: cloudinary.url(publicId, {
      width: 150,
      height: 150,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    }),
    small: cloudinary.url(publicId, {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    }),
    medium: cloudinary.url(publicId, {
      width: 600,
      height: 600,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    }),
    large: cloudinary.url(publicId, {
      width: 1200,
      height: 1200,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    }),
    original: cloudinary.url(publicId, {
      quality: 'auto',
      fetch_format: 'auto'
    })
  };

  return variations;
};

module.exports = {
  cloudinary,
  uploadBuffer,
  deleteImage,
  getOptimizedImageUrl,
  generateImageVariations
};
