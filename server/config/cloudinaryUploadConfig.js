const multer = require('multer');
const path = require('path');
const { uploadToCloudinary } = require('./cloudinary');

// Get file size limit from environment variables or use default (50MB)
const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 50 * 1024 * 1024;

// Use memory storage for Vercel deployment
// Files will be stored in memory temporarily before being uploaded to Cloudinary
const storage = multer.memoryStorage();

// File filter function to validate file types
const fileFilter = (req, file, cb) => {
  // Get file type from request body or default to 'pdf'
  const fileType = req.body.fileType || 'pdf';

  // Check if file type matches the requested type
  if (fileType === 'pdf' && (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf'))) {
    cb(null, true);
  } else if (fileType === 'video' && (file.mimetype.startsWith('video/') ||
                                     file.originalname.match(/\.(mp4|mov|avi|wmv|flv|mkv)$/i))) {
    cb(null, true);
  } else if (fileType === 'document' && (
    file.mimetype.includes('document') ||
    file.mimetype.includes('text/') ||
    file.mimetype.includes('application/vnd.ms-') ||
    file.mimetype.includes('application/vnd.openxmlformats-') ||
    file.originalname.match(/\.(doc|docx|ppt|pptx|xls|xlsx|txt)$/i)
  )) {
    cb(null, true);
  } else {
    // For development, accept any file type if the checks above fail
    cb(null, true);

    // For production, uncomment this instead:
    // cb(new Error(`Invalid file type. Expected ${fileType} but got ${file.mimetype}`), false);
  }
};

// Initialize upload middleware with memory storage and size limits
const multerUpload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE, // Max file size from env or default
    files: 10 // Max 10 files per upload
  },
  fileFilter: fileFilter
});

// Middleware to handle file upload to Cloudinary
const cloudinaryUpload = (fieldName) => {
  return [
    // First use multer to handle the file upload to memory
    multerUpload.single(fieldName),
    
    // Then process the file and upload to Cloudinary
    async (req, res, next) => {
      try {
        // If no file was uploaded, continue
        if (!req.file) {
          return next();
        }

        // Create a buffer from the file
        const buffer = req.file.buffer;
        const originalname = req.file.originalname;

        // Create a temporary file path
        const tempFilePath = path.join('/tmp', originalname);
        
        // Write the buffer to a temporary file
        require('fs').writeFileSync(tempFilePath, buffer);

        // Upload the file to Cloudinary
        const folder = req.body.folder || 'edu_platform';
        const result = await uploadToCloudinary(tempFilePath, folder);

        // Remove the temporary file
        require('fs').unlinkSync(tempFilePath);

        // Add the Cloudinary result to the request object
        req.cloudinaryResult = result;
        
        // Add the file URL to the request
        req.fileUrl = result.secure_url;
        
        next();
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Error uploading file to cloud storage',
          error: error.message
        });
      }
    }
  ];
};

// Middleware to handle multiple file uploads to Cloudinary
const cloudinaryUploadMultiple = (fieldName) => {
  return [
    // First use multer to handle the file uploads to memory
    multerUpload.array(fieldName, 10), // Max 10 files
    
    // Then process the files and upload to Cloudinary
    async (req, res, next) => {
      try {
        // If no files were uploaded, continue
        if (!req.files || req.files.length === 0) {
          return next();
        }

        const uploadPromises = req.files.map(async (file) => {
          // Create a buffer from the file
          const buffer = file.buffer;
          const originalname = file.originalname;

          // Create a temporary file path
          const tempFilePath = path.join('/tmp', originalname);
          
          // Write the buffer to a temporary file
          require('fs').writeFileSync(tempFilePath, buffer);

          // Upload the file to Cloudinary
          const folder = req.body.folder || 'edu_platform';
          const result = await uploadToCloudinary(tempFilePath, folder);

          // Remove the temporary file
          require('fs').unlinkSync(tempFilePath);

          return {
            originalname: file.originalname,
            cloudinaryResult: result,
            url: result.secure_url,
            publicId: result.public_id
          };
        });

        // Wait for all uploads to complete
        const uploadResults = await Promise.all(uploadPromises);

        // Add the Cloudinary results to the request object
        req.cloudinaryResults = uploadResults;
        
        // Add the file URLs to the request
        req.fileUrls = uploadResults.map(result => result.url);
        
        next();
      } catch (error) {
        console.error('Error uploading multiple files to Cloudinary:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Error uploading files to cloud storage',
          error: error.message
        });
      }
    }
  ];
};

module.exports = {
  cloudinaryUpload,
  cloudinaryUploadMultiple,
  multerUpload
};
