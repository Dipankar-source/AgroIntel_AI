// src/utils/fileUpload/fileUpload.js
const ImageKit = require('imagekit');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Helper to clean env variables (trim + strip surrounding quotes + strip extra spaces)
const cleanEnv = (val) => {
    if (!val) return '';
    // First trim all whitespace
    let cleaned = val.trim();
    // Remove surrounding quotes if present
    const match = cleaned.match(/^["'](.*)["']$/);
    if (match) {
        cleaned = match[1].trim();
    }
    // Trim again after quote removal
    return cleaned.trim();
};

const PUBLIC_KEY = cleanEnv(process.env.IMAGEKIT_PUBLIC_KEY);
const PRIVATE_KEY = cleanEnv(process.env.IMAGEKIT_PRIVATE_KEY);
const URL_ENDPOINT = cleanEnv(process.env.IMAGEKIT_URL_ENDPOINT);

// Check if ImageKit credentials are available
if (!PUBLIC_KEY || !PRIVATE_KEY || !URL_ENDPOINT) {
    console.error("❌ Missing ImageKit credentials in .env file");
    console.error("   PUBLIC_KEY:", PUBLIC_KEY ? `✅ ${PUBLIC_KEY.substring(0, 20)}...` : "❌ MISSING");
    console.error("   PRIVATE_KEY:", PRIVATE_KEY ? `✅ ${PRIVATE_KEY.substring(0, 20)}...` : "❌ MISSING");
    console.error("   URL_ENDPOINT:", URL_ENDPOINT ? `✅ ${URL_ENDPOINT}` : "❌ MISSING");
}

// Initialize ImageKit
let imagekit;
try {
    imagekit = new ImageKit({
        publicKey: PUBLIC_KEY,
        privateKey: PRIVATE_KEY,
        urlEndpoint: URL_ENDPOINT
    });

    // Test ImageKit connection
    try {
        const authParams = imagekit.getAuthenticationParameters();
        console.log("✅ ImageKit initialized successfully");
        console.log("   Public Key:", PUBLIC_KEY.substring(0, 20) + "...");
        console.log("   URL Endpoint:", URL_ENDPOINT);
    } catch (authError) {
        console.error("❌ ImageKit authentication test failed:", authError.message);
    }
} catch (initError) {
    console.error("❌ ImageKit initialization failed:", initError.message);
    throw initError;
}

const uploadFile = async (file, options = {}) => {
    try {
        if (!file) {
            throw new Error('No file provided');
        }

        console.log("📤 Uploading file:", file.originalname, "Size:", file.size, "Type:", file.mimetype);

        // Check if file has buffer
        if (!file.buffer) {
            console.error("File has no buffer:", file);
            throw new Error('File buffer is missing');
        }

        const {
            category = 'other',
            userId = null,
            isPublic = false,
            tags = []
        } = options;

        // Generate unique filename
        const fileName = `${uuidv4()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const fileExtension = path.extname(file.originalname).toLowerCase();

        // Determine folder structure - ImageKit folder must be valid path
        // Use simpler folder structure to avoid issues
        const sanitizedUserId = userId ? `${userId}`.replace(/[^a-zA-Z0-9]/g, '') : 'temp';
        const sanitizedCategory = category.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const folder = `/users/${sanitizedUserId}/${sanitizedCategory}`;

        console.log("Upload params:", {
            fileName: fileName.substring(0, 50) + "...",
            folder,
            category,
            fileSize: file.size,
            publicKeySet: !!PUBLIC_KEY,
            privateKeySet: !!PRIVATE_KEY,
            endpointSet: !!URL_ENDPOINT
        });

        // Try uploading with buffer directly first (more reliable than base64 for larger files)
        console.log("   Attempting upload with buffer...");
        
        const uploadResponse = await imagekit.upload({
            file: file.buffer,
            fileName: fileName,
            folder: folder,
            useUniqueFileName: false,
            tags: [category, ...tags],
            isPrivateFile: !isPublic,
            overwriteFile: true
        });

        console.log("✅ Upload successful:", uploadResponse.url);

        // Generate thumbnail URL for images
        let thumbnailUrl = null;
        if (file.mimetype.startsWith('image/')) {
            thumbnailUrl = imagekit.url({
                src: uploadResponse.url,
                transformation: [{
                    width: 200,
                    height: 200,
                    quality: 80
                }]
            });
        }

        // Return file object matching your fileSchema
        return {
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            fileCategory: category,
            fileFormat: fileExtension.replace('.', ''),
            url: uploadResponse.url,
            publicId: uploadResponse.fileId,
            thumbnailUrl: thumbnailUrl,
            isPublic: isPublic,
            metadata: {
                description: options.description || '',
                tags: [category, ...tags],
                uploadedAt: new Date(),
                uploadedBy: userId
            },
            verification: {
                isVerified: false
            },
            version: 1,
            isDeleted: false
        };
    } catch (error) {
        console.error('❌ ImageKit upload error details:');
        console.error('   Error type:', error?.constructor?.name);
        console.error('   Error message:', error?.message);
        console.error('   Error keys:', error && typeof error === 'object' ? Object.keys(error) : 'N/A');
        console.error('   Full error:', error);
        
        // Try to extract useful info from ImageKit response
        let errorMsg = 'Unknown ImageKit error';
        
        try {
            if (error && typeof error === 'object') {
                // Check common ImageKit error response formats
                if (error.message) errorMsg = error.message;
                else if (error.help) errorMsg = `ImageKit API: ${error.help}`;
                else if (error.reason) errorMsg = error.reason;
                else if (error.response?.data?.message) errorMsg = error.response.data.message;
                // If nothing else, stringify it
                else errorMsg = JSON.stringify(error);
            } else if (error && typeof error === 'string') {
                errorMsg = error;
            }
        } catch (parseError) {
            console.error('   Error parsing error object:', parseError);
        }

        // Check credentials
        if (!PUBLIC_KEY || !PRIVATE_KEY || !URL_ENDPOINT) {
            console.error('❌ CRITICAL: Missing ImageKit credentials!');
            errorMsg = 'ImageKit credentials are missing or invalid in .env file';
        }

        console.error('   Final error message:', errorMsg);
        throw new Error(`File upload failed: ${errorMsg}`);
    }
};

const deleteFile = async (fileId) => {
    try {
        if (!fileId) {
            throw new Error('No fileId provided for deletion');
        }
        
        console.log(`🗑️ Deleting file from ImageKit: ${fileId}`);
        await imagekit.deleteFile(fileId);
        console.log(`✅ Successfully deleted file: ${fileId}`);
        return true;
    } catch (error) {
        console.error('❌ ImageKit delete error:', error);
        throw new Error(`File deletion failed: ${error.message || 'Unknown error'}`);
    }
};

const bulkUpload = async (files, options = {}) => {
    try {
        if (!files || files.length === 0) {
            return { successful: [], failed: [] };
        }

        console.log(`📦 Bulk uploading ${files.length} files...`);

        const uploadPromises = files.map(file => uploadFile(file, options));
        const results = await Promise.allSettled(uploadPromises);

        const successful = results
            .filter(r => r.status === 'fulfilled')
            .map(r => r.value);

        const failed = results
            .filter(r => r.status === 'rejected')
            .map(r => r.reason);

        console.log(`✅ Bulk upload complete: ${successful.length} successful, ${failed.length} failed`);

        return { successful, failed };
    } catch (error) {
        console.error('❌ Bulk upload error:', error);
        throw new Error('Bulk upload failed');
    }
};

/**
 * Generate a signed URL for a private ImageKit file.
 * Expires in 3600 seconds (1 hour) by default.
 */
const getSignedUrl = (fileUrl, expireSeconds = 3600) => {
    if (!fileUrl || !imagekit) return fileUrl;
    try {
        return imagekit.url({
            src: fileUrl,
            signed: true,
            expireSeconds,
        });
    } catch (err) {
        console.error('❌ Failed to generate signed URL:', err.message);
        return fileUrl;
    }
};

module.exports = {
    uploadFile,
    bulkUpload,
    deleteFile,
    getSignedUrl
};