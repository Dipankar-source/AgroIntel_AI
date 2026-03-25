const mongoose = require('mongoose');

// Enhanced File Schema (reusable for any file type)
const fileSchema = new mongoose.Schema({
    fileName: { type: String },
    fileType: { type: String },
    fileSize: { type: Number },
    fileCategory: {
        type: String,
        enum: [
            'identity_document',
            'land_document',
            'crop_image',
            'equipment_image',
            'scheme_document',
            'loan_document',
            'profile_image',
            'banner_image',
            'certificate',
            'invoice',
            'contract',
            'other'
        ]
    },
    fileFormat: { type: String },
    url: { type: String },
    publicId: { type: String },
    thumbnailUrl: { type: String },
    isPublic: { type: Boolean, default: false },
    metadata: {
        description: { type: String },
        tags: [{ type: String }],
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        lastAccessed: { type: Date },
        accessCount: { type: Number, default: 0 }
    },
    verification: {
        isVerified: { type: Boolean, default: false },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: { type: Date },
        verificationNotes: { type: String }
    },
    expiryDate: { type: Date },
    version: { type: Number, default: 1 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date }
});

// Document Set Schema
const documentSetSchema = new mongoose.Schema({
    setName: { type: String },
    documentType: {
        type: String,
        enum: [
            'identity_proof',
            'land_records',
            'loan_documents',
            'scheme_enrollment',
            'crop_certification',
            'insurance',
            'contracts',
            'others'
        ]
    },
    files: [fileSchema],
    status: {
        type: String,
        enum: ['pending', 'submitted', 'verified', 'rejected', 'expired'],
        default: 'pending'
    },
    submittedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
    notes: { type: String }
});

// Address Schema
const addressSchema = new mongoose.Schema({
    village: { type: String },
    district: { type: String },
    state: { type: String },
    country: { type: String, default: 'India' },
    pincode: { type: String },
    landmark: { type: String },
    coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
    }
});

// Land Holding Schema
const landHoldingSchema = new mongoose.Schema({
    totalLandArea: { type: Number },
    unit: { type: String, enum: ['acres', 'hectares'], default: 'acres' },
    irrigatedLand: { type: Number },
    nonIrrigatedLand: { type: Number },
    landType: [{
        type: String,
        enum: ['Owned', 'Leased', 'Shared']
    }],
    soilType: {
        type: String,
        enum: ['Alluvial', 'Black', 'Red', 'Laterite', 'Desert', 'Mountain', 'Other']
    },
    soilHealthCardNumber: { type: String },
    landDocuments: [fileSchema],
    surveyDocuments: [fileSchema],
    taxReceipts: [fileSchema]
});

// Crop History Schema
const cropHistorySchema = new mongoose.Schema({
    cropName: { type: String },
    variety: { type: String },
    season: {
        type: String,
        enum: ['Kharif', 'Rabi', 'Zaid', 'Summer', 'Winter']
    },
    year: { type: Number },
    areaCultivated: { type: Number },
    sowingDate: { type: Date },
    harvestDate: { type: Date },
    yieldQuantity: { type: Number },
    unit: { type: String, enum: ['quintals', 'kg', 'tons'] },
    revenue: { type: Number },
    expenses: {
        seeds: { type: Number },
        fertilizers: { type: Number },
        pesticides: { type: Number },
        labor: { type: Number },
        irrigation: { type: Number },
        transportation: { type: Number },
        other: { type: Number }
    },
    challengesFaced: [{ type: String }],
    images: [fileSchema],
    documents: [fileSchema],
    notes: { type: String }
});

// Equipment Schema
const equipmentSchema = new mongoose.Schema({
    name: { type: String },
    type: {
        type: String,
        enum: ['Tractor', 'Harvester', 'Plough', 'Irrigation System', 'Sprayer', 'Other']
    },
    ownershipType: { type: String, enum: ['Owned', 'Rented', 'Shared'] },
    purchaseDate: { type: Date },
    condition: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor'] },
    specifications: { type: String },
    images: [fileSchema],
    documents: [fileSchema],
    maintenanceRecords: [fileSchema]
});

// Government Scheme Enrollment Schema
const schemeEnrollmentSchema = new mongoose.Schema({
    schemeName: { type: String },
    schemeType: {
        type: String,
        enum: ['Subsidy', 'Insurance', 'Loan', 'Training', 'Direct Benefit']
    },
    enrollmentDate: { type: Date },
    status: { type: String, enum: ['Active', 'Pending', 'Expired', 'Rejected'] },
    benefits: { type: String },
    documents: [fileSchema],
    applicationForm: fileSchema,
    approvalLetter: fileSchema,
    rejectionReason: { type: String }
});

// Bank Details Schema
const bankDetailsSchema = new mongoose.Schema({
    accountHolderName: { type: String },
    bankName: { type: String },
    branchName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    accountType: { type: String, enum: ['Savings', 'Current'] },
    upiId: { type: String },
    documents: [fileSchema],
    verified: { type: Boolean, default: false }
});

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
    plan: {
        type: String,
        enum: ['Free', 'Basic', 'Premium', 'Enterprise'],
        default: 'Free'
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    autoRenew: { type: Boolean, default: true },
    features: [{
        name: String,
        isEnabled: { type: Boolean, default: true }
    }],
    paymentHistory: [{
        amount: Number,
        date: { type: Date, default: Date.now },
        transactionId: String,
        paymentMethod: String,
        invoice: fileSchema
    }]
});

// Active Plan Schema - Tracks the currently active subscription plan
const activePlanSchema = new mongoose.Schema({
    planId: {
        type: String,
        enum: ['free', 'premium', 'superPremium'],
        default: 'free'
    },
    planName: {
        type: String,
        enum: ['Free', 'Premium', 'Super Premium'],
        default: 'Free'
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'pending', 'paused'],
        default: 'active'
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'annual'],
        default: 'monthly'
    },
    currentPrice: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    renewalDate: { type: Date },
    autoRenew: { type: Boolean, default: true },
    isTrialPlan: { type: Boolean, default: false },
    trialDaysLeft: { type: Number, default: 0 },
    lastRenewalDate: { type: Date },
    cancellationDate: { type: Date },
    cancellationReason: { type: String },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'completed'
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    features: [{
        featureName: { type: String },
        isEnabled: { type: Boolean, default: true },
        usage: { type: Number, default: 0 },
        limit: { type: Number, default: null }
    }],
    upgradedFrom: { type: String }, 
    renewalAttempts: { type: Number, default: 0 },
    lastFailedRenewal: { type: Date }
});

// Notification Preferences Schema
const notificationPrefsSchema = new mongoose.Schema({
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
    weatherAlerts: { type: Boolean, default: true },
    marketPrices: { type: Boolean, default: true },
    schemeUpdates: { type: Boolean, default: true },
    communityPosts: { type: Boolean, default: true },
    aiRecommendations: { type: Boolean, default: true }
});

// Farmer Points Schema
const farmerPointsSchema = new mongoose.Schema({
    totalPoints: { type: Number, default: 0 },
    weeklyPoints: { type: Number, default: 0 },
    uploadedFileHashes: [{ 
        hash: { type: String },
        pointsAwarded: { type: Number },
        uploadedAt: { type: Date, default: Date.now }
    }],
    weekResetDate: { type: Date, default: Date.now },
    pointHistory: [{
        action: { type: String, enum: ['upload', 'delete', 'manual_adjustment'] },
        amount: { type: Number },
        description: { type: String },
        documentId: { type: mongoose.Schema.Types.ObjectId },
        timestamp: { type: Date, default: Date.now }
    }]
});

const userSchema = new mongoose.Schema({
    // Basic Information - ONLY THESE ARE REQUIRED
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },

    // EVERYTHING BELOW IS OPTIONAL
    farmerType: {
        type: String,
        enum: ['Small Farmer', 'Medium Farmer', 'Large Farmer', 'Contract Farmer', 'Organic Farmer', 'Dairy Farmer', 'Poultry Farmer', 'Fisherman'],
    },

    farmingExperience: {
        type: Number,
        min: 0,
        max: 100
    },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },

    // Address Information
    address: addressSchema,

    // Comprehensive File Management
    documents: [fileSchema],

    // Organized Document Sets
    documentSets: [documentSetSchema],

    // Identity Documents
    identityDocuments: [fileSchema],

    // Profile Media
    profilePicture: fileSchema,
    bannerImage: fileSchema,

    // Agricultural Profile
    landHoldings: landHoldingSchema,
    cropsHistory: [cropHistorySchema],
    currentCrops: [{
        cropName: { type: String },
        variety: { type: String },
        area: { type: Number },
        sowingDate: { type: Date },
        expectedHarvestDate: { type: Date },
        stage: {
            type: String,
            enum: ['Sowing', 'Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Harvesting']
        },
        healthStatus: { type: String, enum: ['Healthy', 'At Risk', 'Infected', 'Damaged'] },
        lastInspectionDate: { type: Date },
        notes: { type: String },
        images: [fileSchema],
        documents: [fileSchema]
    }],

    // Farm Management
    equipment: [equipmentSchema],
    livestock: [{
        animalType: { type: String },
        breed: { type: String },
        count: { type: Number },
        healthStatus: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor'] },
        vaccinationStatus: { type: String },
        lastCheckup: { type: Date },
        notes: { type: String },
        images: [fileSchema],
        documents: [fileSchema]
    }],

    // Financial Information
    bankDetails: bankDetailsSchema,
    loans: [{
        loanType: { type: String, enum: ['Crop Loan', 'Equipment Loan', 'Land Development', 'Emergency'] },
        bankName: { type: String },
        amount: { type: Number },
        interestRate: { type: Number },
        startDate: { type: Date },
        endDate: { type: Date },
        status: { type: String, enum: ['Active', 'Closed', 'Default'] },
        documents: [fileSchema],
        agreementDocument: fileSchema,
        repaymentSchedule: fileSchema
    }],
    subsidiesReceived: [{
        schemeName: String,
        amount: Number,
        date: Date,
        status: String,
        documents: [fileSchema]
    }],

    // Government Schemes
    enrolledSchemes: [schemeEnrollmentSchema],

    // Market Preferences
    marketPreferences: {
        preferredMarkets: [{
            marketName: String,
            location: String,
            distance: Number
        }],
        preferredBuyers: [{ type: String }],
        commodityPreferences: [{
            commodity: String,
            minPrice: Number,
            maxPrice: Number,
            isActive: { type: Boolean, default: true }
        }]
    },

    // Subscription
    subscription: subscriptionSchema,

    // Active Plan - Tracks the current active subscription
    activePlan: {
        type: activePlanSchema,
        default: () => ({
            planId: 'free',
            planName: 'Free',
            status: 'active',
            billingCycle: 'monthly',
            currentPrice: 0,
            gst: 0,
            totalPrice: 0,
            autoRenew: true,
            isTrialPlan: false,
            paymentStatus: 'completed'
        })
    },

    // Farmer Points
    farmerPoints: {
        type: farmerPointsSchema,
        default: {}
    },

    // Notification Preferences
    notificationPreferences: notificationPrefsSchema,

    // AI Recommendations
    aiRecommendations: [{
        type: { type: String, enum: ['Crop', 'Fertilizer', 'Pesticide', 'Irrigation', 'Market', 'Weather'] },
        title: String,
        description: String,
        date: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false },
        isImplemented: { type: Boolean, default: false },
        feedback: { type: String, enum: ['Helpful', 'Not Helpful', 'Not Applicable'] }
    }],

    // Weather Alerts
    weatherAlerts: [{
        alertType: { type: String, enum: ['Heavy Rain', 'Drought', 'Storm', 'Frost', 'Heat Wave'] },
        severity: { type: String, enum: ['Low', 'Medium', 'High', 'Extreme'] },
        message: String,
        date: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false }
    }],

    // Community Features
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Transactions
    transactions: [{
        type: { type: String, enum: ['Crop Sale', 'Purchase', 'Loan Payment', 'Subscription'] },
        amount: Number,
        date: { type: Date, default: Date.now },
        description: String,
        paymentMethod: String,
        status: { type: String, enum: ['Pending', 'Completed', 'Failed'] },
        documents: [fileSchema]
    }],

    // Support Tickets
    supportTickets: [{
        ticketId: String,
        issue: String,
        status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'] },
        priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'] },
        createdAt: { type: Date, default: Date.now },
        resolvedAt: Date,
        attachments: [fileSchema],
        messages: [{
            sender: { type: String, enum: ['Farmer', 'Support'] },
            message: String,
            timestamp: { type: Date, default: Date.now },
            attachments: [fileSchema]
        }]
    }],

    // System Fields
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,

    // App Preferences
    language: { type: String, default: 'en' },
    theme: { type: String, enum: ['Light', 'Dark', 'System'], default: 'Light' }
}, {
    timestamps: true
});

// Indexes for better query performance
userSchema.index({ 'address.district': 1, 'address.state': 1 });
userSchema.index({ 'currentCrops.cropName': 1 });
userSchema.index({ 'landHoldings.totalLandArea': 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'subscription.plan': 1 });
userSchema.index({ 'activePlan.planId': 1 });
userSchema.index({ 'activePlan.status': 1 });
userSchema.index({ 'activePlan.endDate': 1 });
userSchema.index({ 'documents.fileCategory': 1, 'documents.metadata.uploadedAt': -1 });
userSchema.index({ farmerType: 1 });
userSchema.index({ lastLogin: -1 });

// Virtual for age calculation
userSchema.virtual('age').get(function () {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

// Methods for file management
userSchema.methods.addFile = function (fileData, category) {
    const file = {
        ...fileData,
        fileCategory: category,
        'metadata.uploadedAt': new Date()
    };
    this.documents.push(file);
    return this.save();
};

userSchema.methods.getFilesByCategory = function (category) {
    return this.documents.filter(doc => doc.fileCategory === category && !doc.isDeleted);
};

userSchema.methods.getDocumentSet = function (setName) {
    return this.documentSets.find(set => set.setName === setName);
};

userSchema.methods.verifyDocument = function (documentId, verifierId, notes) {
    const document = this.documents.id(documentId);
    if (document) {
        document.verification = {
            isVerified: true,
            verifiedBy: verifierId,
            verifiedAt: new Date(),
            verificationNotes: notes
        };
    }
    return this.save();
};

userSchema.methods.softDeleteDocument = function (documentId) {
    const document = this.documents.id(documentId);
    if (document) {
        document.isDeleted = true;
        document.deletedAt = new Date();
    }
    return this.save();
};

userSchema.methods.isAccountLocked = function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incrementLoginAttempts = function () {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
        this.lockUntil = Date.now() + 3600000; // Lock for 1 hour
    }
    return this.save();
};
// Example of how to refactor your methods
userSchema.methods.addFile = async function (fileData, category) {
    const file = {
        ...fileData,
        fileCategory: category,
        'metadata.uploadedAt': new Date()
    };
    this.documents.push(file);
    return await this.save(); 
};

// Static methods for file cleanup
userSchema.statics.cleanupExpiredDocuments = function () {
    return this.updateMany(
        { 'documents.expiryDate': { $lt: new Date() } },
        { $set: { 'documents.$.isDeleted': true, 'documents.$.deletedAt': new Date() } }
    );
};

module.exports = mongoose.model('User', userSchema);