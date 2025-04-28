// Import both upload configurations
const { upload } = require('../config/uploadConfig');
const { cloudinaryUpload, cloudinaryUploadMultiple, multerUpload } = require('../config/cloudinaryUploadConfig');

// Determine which upload middleware to use based on environment
const isProduction = process.env.NODE_ENV === 'production';

// Export the appropriate middleware based on environment
module.exports = {
  // For single file uploads
  single: (fieldName) => {
    return isProduction
      ? cloudinaryUpload(fieldName)
      : upload.single(fieldName);
  },

  // For multiple file uploads
  array: (fieldName, maxCount) => {
    return isProduction
      ? cloudinaryUploadMultiple(fieldName)
      : upload.array(fieldName, maxCount || 10);
  },

  // For fields with multiple files
  fields: (fields) => {
    // In production, we need to handle this differently
    // This is a simplified version that may need to be expanded
    return isProduction
      ? multerUpload.fields(fields)
      : upload.fields(fields);
  },

  // Legacy support for direct access to the upload middleware
  upload: isProduction ? multerUpload : upload
};
