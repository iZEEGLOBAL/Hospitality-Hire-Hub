const {
  uploadCV,
  uploadCertificate,
  uploadPhoto,
  uploadResource,
  uploadGallery,
  uploadCompanyLogo,
} = require('../config/cloudinary');

// Upload CV middleware
exports.uploadCV = uploadCV.single('cv');

// Upload certificate middleware
exports.uploadCertificate = uploadCertificate.single('certificate');

// Upload photo middleware
exports.uploadPhoto = uploadPhoto.single('photo');

// Upload passport photo middleware
exports.uploadPassportPhoto = uploadPhoto.single('passportPhoto');

// Upload resource middleware
exports.uploadResource = uploadResource.single('file');

// Upload gallery image middleware
exports.uploadGallery = uploadGallery.single('image');

// Upload company logo middleware
exports.uploadCompanyLogo = uploadCompanyLogo.single('logo');

// Upload multiple images middleware
exports.uploadMultipleImages = uploadGallery.array('images', 10);

// Handle upload errors
exports.handleUploadError = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed',
    });
  }
  next();
};
