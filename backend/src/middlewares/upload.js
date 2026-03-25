// src/middlewares/upload.js
const multer = require('multer');

// Configure memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  try {
    console.log("📁 Filtering file:", file.originalname, "MIME:", file.mimetype);

    // Allowed file types
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      console.log(`✅ File type allowed: ${file.mimetype}`);
      cb(null, true);
    } else {
      const err = new Error(`❌ Invalid file type: ${file.mimetype}. Allowed types: images, PDFs, Word docs, Excel sheets, CSV, and text files.`);
      console.error(err.message);
      cb(err, false);
    }
  } catch (error) {
    console.error("❌ File filter error:", error);
    cb(error, false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10
  }
});

// Custom error handler
const handleMulterError = (error, req, res, next) => {
  console.error("❌ Middleware error:", error);
  
  if (error instanceof multer.MulterError) {
    console.error("Multer error code:", error.code);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        msg: 'File too large. Maximum size is 10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        msg: 'Too many files. Maximum is 10 files'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        msg: `Unexpected field: ${error.field}`
      });
    }
  }
  
  // If it's a file filter error
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      msg: error.message
    });
  }
  
  // For other errors, pass to next middleware
  next(error);
};

module.exports = {
  upload,
  handleMulterError
};