const User = require('../../models/User/userData');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { uploadFile, bulkUpload } = require('../../utils/fileUpload/fileUpload');
const Notification = require("../../models/Notification/notification");
const { initializeFarmerPoints, generateFileHash, addUploadPoints } = require('../../utils/points/pointsUtils');

const RegisterControllerAPI = async (req, res) => {
    try {
        console.log("=== REGISTRATION ATTEMPT ===");
        console.log("Request body keys:", Object.keys(req.body));
        console.log("Request files:", req.files ? Object.keys(req.files) : "No files");

        // Parse body data correctly
        let bodyData = req.body;

        // If body is string, parse it
        if (typeof req.body === 'string') {
            try {
                bodyData = JSON.parse(req.body);
            } catch (e) {
                console.log("Body is not JSON string, using as is");
            }
        }

        const {
            fullName,
            email,
            password,
            phoneNumber,
            language,
            farmerType,
        } = bodyData;

        console.log("Extracted data:", {
            fullName,
            email,
            phoneNumber,
            passwordProvided: !!password
        });

        // Validate required fields
        const requiredFields = ['fullName', 'email', 'password', 'phoneNumber'];
        for (const field of requiredFields) {
            if (!bodyData[field]) {
                console.log(`Missing field: ${field}`);
                return res.status(400).json({
                    success: false,
                    msg: `${field} is required`
                });
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid email format'
            });
        }

        // Validate phone number (Indian format)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid phone number. Must be 10 digits starting with 6-9'
            });
        }

        // Check password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                msg: 'Password must be at least 6 characters long'
            });
        }

        // Check if email already exists
        const isEmailExist = await User.findOne({ email });
        if (isEmailExist) {
            return res.status(409).json({
                success: false,
                msg: "The entered email already exists"
            });
        }

        // Check if phone number already exists
        const isPhoneExist = await User.findOne({ phoneNumber });
        if (isPhoneExist) {
            return res.status(409).json({
                success: false,
                msg: "Phone number already registered"
            });
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create user object with only required fields initially
        const userData = {
            fullName,
            email,
            phoneNumber,
            password: hashPassword,
            isActive: true,
            isVerified: false,
            loginAttempts: 0,
            language: (language && ['en', 'hi', 'bn'].includes(language)) ? language : 'en',
            farmerType: farmerType || undefined,
            theme: 'Light',
            // Initialize farmer points for Free plan (default)
            farmerPoints: initializeFarmerPoints('Free')
        };

        console.log("Creating user with data:", { ...userData, password: '[HIDDEN]' });

        // Create new user
        const newUser = new User(userData);

        // Save user first WITHOUT file references
        console.log("Saving user to database...");
        const savedUser = await newUser.save();
        console.log("User saved successfully with ID:", savedUser._id);

        // Handle file uploads if any files were sent
        const uploadedFiles = [];
        const identityDocuments = [];
        let profilePicture = null;

        if (req.files && Object.keys(req.files).length > 0) {
            console.log("Processing files...");

            // Handle identity documents
            if (req.files.identityDocument && req.files.identityDocument.length > 0) {
                try {
                    console.log("Uploading identity documents...");
                    const identityUploads = await bulkUpload(req.files.identityDocument, {
                        category: 'identity_document',
                        userId: savedUser._id,
                        isPublic: true,
                        tags: ['identity', 'verification']
                    });

                    if (identityUploads.successful && identityUploads.successful.length > 0) {
                        identityDocuments.push(...identityUploads.successful);
                        uploadedFiles.push(...identityUploads.successful);
                        console.log(`Uploaded ${identityUploads.successful.length} identity documents`);
                    }
                } catch (uploadError) {
                    console.error('Identity documents upload failed:', uploadError);
                    // Don't fail the whole registration if file upload fails
                }
            }

            // Handle other documents
            if (req.files.documents && req.files.documents.length > 0) {
                try {
                    console.log("Uploading other documents...");
                    const otherUploads = await bulkUpload(req.files.documents, {
                        category: 'other',
                        userId: savedUser._id,
                        isPublic: true,
                        tags: ['document']
                    });

                    if (otherUploads.successful && otherUploads.successful.length > 0) {
                        uploadedFiles.push(...otherUploads.successful);
                        console.log(`Uploaded ${otherUploads.successful.length} other documents`);
                    }
                } catch (uploadError) {
                    console.error('Other documents upload failed:', uploadError);
                    // Don't fail the whole registration if file upload fails
                }
            }

            // Handle profile picture
            if (req.files.profilePicture && req.files.profilePicture.length > 0) {
                try {
                    console.log("Uploading profile picture...");
                    const profileUpload = await uploadFile(req.files.profilePicture[0], {
                        category: 'profile_image',
                        userId: savedUser._id,
                        isPublic: true,
                        tags: ['profile']
                    });

                    if (profileUpload) {
                        profilePicture = profileUpload;
                        console.log("Profile picture uploaded successfully");
                    }
                } catch (uploadError) {
                    console.error('Profile picture upload failed:', uploadError);
                    // Don't fail the whole registration if file upload fails
                }
            }

            // Update user with file references if any files were uploaded
            if (identityDocuments.length > 0 || uploadedFiles.length > 0 || profilePicture) {
                console.log("Updating user with file references...");

                if (identityDocuments.length > 0) {
                    savedUser.identityDocuments = identityDocuments;
                }

                if (uploadedFiles.length > 0) {
                    savedUser.documents = uploadedFiles;
                }

                if (profilePicture) {
                    savedUser.profilePicture = profilePicture;
                }

                // Award 0.6 points per uploaded document (excluding profile picture)
                const allDocs = req.files.documents || [];
                const allIdentity = req.files.identityDocument || [];
                const docsToAward = [...allDocs, ...allIdentity];
                for (const file of docsToAward) {
                    const hash = generateFileHash(file);
                    if (hash) {
                        await addUploadPoints(savedUser, hash, file);
                    }
                }

                await savedUser.save();
                console.log("User updated with file references");
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: savedUser._id,
                email: savedUser.email,
                phoneNumber: savedUser.phoneNumber
            },
            process.env.JWT_SECRET,
            { expiresIn: '2d' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 2 * 24 * 60 * 60 * 1000 // 2 days
        });

        // Prepare response data
        const userData_response = {
            id: savedUser._id,
            fullName: savedUser.fullName,
            email: savedUser.email,
            phoneNumber: savedUser.phoneNumber,
            isVerified: savedUser.isVerified,
            hasProfilePicture: !!savedUser.profilePicture,
            documentsCount: savedUser.documents ? savedUser.documents.length : 0,
            identityDocumentsCount: savedUser.identityDocuments ? savedUser.identityDocuments.length : 0
        };

        console.log("Registration successful for:", email);

        // Create a welcome notification (best-effort)
        try {
            await Notification.create({
                userId: savedUser._id,
                title: "Welcome!",
                message: "Thanks for signing up. Explore soil analysis, crop planning, and market insights.",
                type: "auth",
            });
        } catch (notifyErr) {
            console.error("WELCOME_NOTIFICATION_CREATE_ERROR:", notifyErr);
        }

        return res.status(201).json({
            success: true,
            msg: "User registered successfully",
            data: userData_response,
            token: token
        });

    } catch (error) {
        console.error("=== REGISTRATION ERROR ===");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        if (error.code) {
            console.error("Error code:", error.code);
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                success: false,
                msg: `${field} already exists`
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({
                success: false,
                msg: "Validation error",
                errors
            });
        }

        // Handle MongoDB connection errors
        if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
            return res.status(503).json({
                success: false,
                msg: "Database connection error. Please try again later."
            });
        }

        // Handle JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(500).json({
                success: false,
                msg: "Error generating authentication token"
            });
        }

        // Generic error response
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = RegisterControllerAPI;