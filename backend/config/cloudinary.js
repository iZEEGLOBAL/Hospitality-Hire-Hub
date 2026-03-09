const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage for different file types
const createStorage = (folder, allowedFormats) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `hospitality-hire-hub/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [{ quality: 'auto' }],
    },
  });
};

// Upload configurations
const uploadCV = multer({
  storage: createStorage('cvs', ['pdf', 'doc', 'docx']),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const uploadCertificate = multer({
  storage: createStorage('certificates', ['pdf', 'jpg', 'jpeg', 'png']),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadPhoto = multer({
  storage: createStorage('photos', ['jpg', 'jpeg', 'png']),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

const uploadResource = multer({
  storage: createStorage('resources', ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip']),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

const uploadGallery = multer({
  storage: createStorage('gallery', ['jpg', 'jpeg', 'png']),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const uploadCompanyLogo = multer({
  storage: createStorage('company-logos', ['jpg', 'jpeg', 'png']),
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = {
  cloudinary,
  uploadCV,
  uploadCertificate,
  uploadPhoto,
  uploadResource,
  uploadGallery,
  uploadCompanyLogo,
};
