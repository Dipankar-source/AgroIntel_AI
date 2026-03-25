const crypto = require('crypto');

// Initial points based on subscription plan
const INITIAL_POINTS = {
    'Free': 0,
    'Basic': 0,
    'Premium': 39,
    'Super Premium': 49,
};

// Points awarded per valid file upload (tier-based)
const POINTS_PER_UPLOAD = {
    'Free': 0.6,
    'Basic': 0.6,
    'Premium': 12,
    'Super Premium': 30,
};

const SUPER_PREMIUM_KEYWORDS = ['super', 'super premium', 'superpremium'];

/**
 * Get initial points based on subscription plan
 */
const getInitialPointsForPlan = (plan) => {
    if (!plan) return INITIAL_POINTS['Free'];
    
    const planStr = plan.toString().toLowerCase();
    
    // Check for super premium
    if (SUPER_PREMIUM_KEYWORDS.some(keyword => planStr.includes(keyword))) {
        return 49;
    }
    
    // Check for premium
    if (planStr.includes('premium')) {
        return 39;
    }
    
    // Default to free
    return 0;
};

/**
 * Generate hash for file to detect duplicates
 * Uses filename + filesize + last modified time
 */
const generateFileHash = (file) => {
    try {
        const data = `${file.originalname}-${file.size}-${file.mimetype}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    } catch (err) {
        console.error('Error generating file hash:', err);
        return null;
    }
};

/**
 * Check if file was already uploaded (duplicate check)
 */
const isFileDuplicate = (user, fileHash) => {
    if (!user.farmerPoints || !user.farmerPoints.uploadedFileHashes) {
        return false;
    }
    
    return user.farmerPoints.uploadedFileHashes.some(
        entry => entry.hash === fileHash
    );
};

/**
 * Get points for a document upload based on user's subscription plan
 */
const getUploadPoints = (plan) => {
    if (!plan) return POINTS_PER_UPLOAD['Free'];
    const planStr = plan.toString().toLowerCase();
    if (SUPER_PREMIUM_KEYWORDS.some(k => planStr.includes(k))) return POINTS_PER_UPLOAD['Super Premium'];
    if (planStr.includes('premium')) return POINTS_PER_UPLOAD['Premium'];
    return POINTS_PER_UPLOAD['Free'];
};

/**
 * Add points to user for document upload
 * Awards points based on subscription tier: Free=0.6, Premium=12, Super Premium=30
 */
const addUploadPoints = async (user, fileHash, file) => {
    if (!user.farmerPoints) {
        user.farmerPoints = {};
    }
    
    const plan = user.activePlan?.planName || 'Free';
    const points = getUploadPoints(plan);
    
    // Initialize if not exists
    if (!user.farmerPoints.uploadedFileHashes) {
        user.farmerPoints.uploadedFileHashes = [];
    }
    if (!user.farmerPoints.pointHistory) {
        user.farmerPoints.pointHistory = [];
    }
    if (!user.farmerPoints.totalPoints) {
        user.farmerPoints.totalPoints = 0;
    }
    if (!user.farmerPoints.weeklyPoints) {
        user.farmerPoints.weeklyPoints = 0;
    }
    
    // Add to uploaded file hashes
    user.farmerPoints.uploadedFileHashes.push({
        hash: fileHash,
        pointsAwarded: points,
        uploadedAt: new Date()
    });
    
    // Update total points
    user.farmerPoints.totalPoints += points;
    
    // Add to history (weekly points are recalculated from history)
    user.farmerPoints.pointHistory.push({
        action: 'upload',
        amount: points,
        description: `Upload: ${file.originalname}`,
        documentId: null, // Will be set by controller if needed
        timestamp: new Date()
    });
    
    return points;
};

/**
 * Remove points from user for document deletion
 * Deducts points based on subscription tier: Free=0.6, Premium=12, Super Premium=30
 */
const removeDeletePoints = async (user, fileHash, file) => {
    if (!user.farmerPoints) {
        return 0;
    }
    
    const plan = user.activePlan?.planName || 'Free';
    const pointsToRemove = getUploadPoints(plan);
    
    // Remove from uploaded file hashes if tracking exists
    if (user.farmerPoints.uploadedFileHashes) {
        user.farmerPoints.uploadedFileHashes = user.farmerPoints.uploadedFileHashes.filter(
            entry => entry.hash !== fileHash
        );
    }
    
    // Deduct total points (weekly is recalculated from history)
    user.farmerPoints.totalPoints = Math.max(0, (user.farmerPoints.totalPoints || 0) - pointsToRemove);
    
    // Add to history
    if (!user.farmerPoints.pointHistory) {
        user.farmerPoints.pointHistory = [];
    }
    user.farmerPoints.pointHistory.push({
        action: 'delete',
        amount: -pointsToRemove,
        description: `Delete: ${file.originalname}`,
        documentId: null, // Will be set by controller if needed
        timestamp: new Date()
    });
    
    return pointsToRemove;
};

/**
 * Reset weekly points if more than 7 days have passed,
 * then recalculate weeklyPoints from pointHistory entries within the current week window.
 */
const resetWeeklyPointsIfNeeded = (user) => {
    if (!user.farmerPoints) return;
    
    const now = new Date();
    let weekStart = user.farmerPoints.weekResetDate || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const daysSinceReset = (now - weekStart) / (1000 * 60 * 60 * 24);
    
    if (daysSinceReset >= 7) {
        // Advance the week window
        weekStart = now;
        user.farmerPoints.weekResetDate = now;
    }
    
    // Recalculate weekly points from ALL history entries within the current week (uploads + deletes)
    const history = user.farmerPoints.pointHistory || [];
    let weekly = 0;
    for (const entry of history) {
        if (entry.timestamp && new Date(entry.timestamp) >= weekStart) {
            weekly += entry.amount;
        }
    }
    user.farmerPoints.weeklyPoints = Math.max(0, parseFloat(weekly.toFixed(1)));
};

/**
 * Initialize farmer points for new user
 */
const initializeFarmerPoints = (plan) => {
    const initialPoints = getInitialPointsForPlan(plan);
    return {
        totalPoints: initialPoints,
        weeklyPoints: 0,
        uploadedFileHashes: [],
        weekResetDate: new Date(),
        pointHistory: [{
            action: 'manual_adjustment',
            amount: initialPoints,
            description: `Account creation - ${plan || 'Free'} plan`,
            timestamp: new Date()
        }]
    };
};

/**
 * Update points when subscription tier changes
 * Adds the difference between old and new tier initial points
 */
const updatePointsOnSubscriptionChange = (user, newPlan) => {
    if (!user.farmerPoints) {
        user.farmerPoints = initializeFarmerPoints(newPlan);
        return user.farmerPoints.totalPoints;
    }
    
    const newInitialPoints = getInitialPointsForPlan(newPlan);
    // Find the original account creation entry to get old initial points
    const creationEntry = user.farmerPoints.pointHistory?.find(
        entry => entry.action === 'manual_adjustment' && entry.description?.includes('Account creation')
    );
    const oldInitialPoints = creationEntry?.amount || 0; // default to Free tier
    
    const pointsDifference = newInitialPoints - oldInitialPoints;
    
    if (pointsDifference > 0) {
        user.farmerPoints.totalPoints += pointsDifference;
        
        if (!user.farmerPoints.pointHistory) {
            user.farmerPoints.pointHistory = [];
        }
        
        user.farmerPoints.pointHistory.push({
            action: 'manual_adjustment',
            amount: pointsDifference,
            description: `Subscription upgraded to ${newPlan}`,
            timestamp: new Date()
        });
    }
    
    return pointsDifference;
};

module.exports = {
    INITIAL_POINTS,
    POINTS_PER_UPLOAD,
    getInitialPointsForPlan,
    generateFileHash,
    isFileDuplicate,
    getUploadPoints,
    addUploadPoints,
    removeDeletePoints,
    resetWeeklyPointsIfNeeded,
    initializeFarmerPoints,
    updatePointsOnSubscriptionChange
};
