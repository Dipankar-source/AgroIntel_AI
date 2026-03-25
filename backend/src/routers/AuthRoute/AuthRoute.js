const express = require('express');
const router = express.Router();
const RegisterControllerAPI = require('../../controllers/AuthController/registerController');
const jwt = require('jsonwebtoken');
const User = require('../../models/User/userData');

// Destructure the two controllers from the Login file
const {
    LoginControllerAPI,
    VerifyOTPControllerAPI,
} = require('../../controllers/AuthController/loginController');

const {
    SendChangePasswordOTP,
    VerifyChangePassword,
    SendForgotPasswordOTP,
    VerifyForgotPasswordOTP,
    ResetPassword
} = require('../../controllers/AuthController/passwordController');

const { upload } = require('../../middlewares/upload');

// 1. Register Route
router.post('/register',
    upload.fields([
        { name: 'profilePicture', maxCount: 1 },
        { name: 'identityDocument', maxCount: 5 },
        { name: 'documents', maxCount: 10 }
    ]),
    (req, res, next) => {
        console.log("Files received:", req.files ? Object.keys(req.files) : "No files");
        next();
    },
    RegisterControllerAPI
);

// 2. Login Route (Step 1: Credentials -> Send OTP)
router.post('/login', LoginControllerAPI);

// 3. OTP Verification Route (Step 2: OTP -> JWT Token)
router.post('/verify-otp', VerifyOTPControllerAPI);

// 4. Change Password (authenticated) — send OTP then verify
router.post('/change-password/send-otp', authenticateToken, SendChangePasswordOTP);
router.post('/change-password/verify', authenticateToken, VerifyChangePassword);

// 5. Forgot Password (public) — send OTP, verify OTP, reset password
router.post('/forgot-password/send-otp', SendForgotPasswordOTP);
router.post('/forgot-password/verify-otp', VerifyForgotPasswordOTP);
router.post('/forgot-password/reset', ResetPassword);

// @route   GET /api/auth/verify
// @desc    Verify token and return user data
// @access  Private
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const user = await User.findById(userId).select('-password -verificationToken -resetPasswordExpires');
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                fullName: user.fullName || '',
                email: user.email,
                phoneNumber: user.phoneNumber || '',
                role: user.role || 'user'
            }
        });
    } catch (err) {
        console.error('Verify error:', err);
        res.status(500).json({ success: false, msg: 'Server error' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user from cookie
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const user = await User.findById(userId).select('-password -verificationToken -resetPasswordExpires');
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                fullName: user.fullName || '',
                email: user.email,
                phoneNumber: user.phoneNumber || '',
                role: user.role || 'user'
            }
        });
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({ success: false, msg: 'Server error' });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user and clear cookie
// @access  Public
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.json({ success: true, msg: 'Logged out successfully' });
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    // Check for token in cookie first
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ success: false, msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ success: false, msg: 'Token is not valid' });
    }
}

module.exports = router;