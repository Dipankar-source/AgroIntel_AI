// middlewares/uploadMedia.js
const multer = require('multer')
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images and PDFs
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only image and PDF files are allowed!'), false);
        }
    }
});

// Create separate middleware for multiple files
const uploadMedia = upload.fields([
    { name: 'file', maxCount: 1 },    // Profile picture
    { name: 'banner', maxCount: 1 },   // Banner image
    { name: 'experienceCertificate', maxCount: 10 }, // Experience certificates
    { name: 'educationCertificate', maxCount: 10 }   // Education certificates
]);

module.exports = uploadMedia;