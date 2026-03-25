const User = require('../../models/User/userData');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail } = require('../../utils/otp/otpService');
const Notification = require("../../models/Notification/notification");

const LoginControllerAPI = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check for missing fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                msg: "Please provide email and password"
            });
        }

        // 2. Find user with case-insensitive email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                msg: "Invalid credentials"
            });
        }

        // 3. Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                msg: "Invalid credentials"
            });
        }

        // 4. Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

        // 5. Save OTP and Expiry to database
        user.verificationToken = otp;
        user.resetPasswordExpires = otpExpiry;
        await user.save();

        // 6. Send OTP Email
        try {
            await sendOTPEmail(user.email, otp);
            console.log(`OTP sent successfully to ${email}`);
        } catch (mailError) {
            console.error("Email sending failed:", mailError.message);
            // Still return success with OTP for testing
            console.log(`⚠️ DEBUG - OTP for ${email}: ${otp}`);
        }

        // 7. Return success response
        return res.status(200).json({
            success: true,
            msg: "Verification code sent to email",
            step: "OTP_VERIFICATION",
            email: user.email // Return email for frontend
        });

    } catch (error) {
        console.error("LOGIN_CONTROLLER_ERROR:", error);
        return res.status(500).json({
            success: false,
            msg: "Server Error. Please try again later."
        });
    }
};

const VerifyOTPControllerAPI = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                msg: "Email and OTP are required"
            });
        }

        // 1. Find user with valid, non-expired OTP
        const user = await User.findOne({
            email: email.toLowerCase(),
            verificationToken: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                msg: "Invalid or expired OTP. Please try logging in again."
            });
        }

        // 2. Clear OTP fields and update last login
        user.verificationToken = undefined;
        user.resetPasswordExpires = undefined;
        user.lastLogin = Date.now();
        await user.save();

        // Create a login notification (best-effort)
        try {
            await Notification.create({
                userId: user._id,
                title: "Login successful",
                message: "You have successfully logged in.",
                type: "auth",
            });
        } catch (notifyErr) {
            console.error("LOGIN_NOTIFICATION_CREATE_ERROR:", notifyErr);
        }

        // 3. Generate JWT Token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role || 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Extended to 7 days
        );

        // 4. Set Secure Cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // 5. Return success response with user data
        return res.status(200).json({
            success: true,
            msg: "Login successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName || '',
                email: user.email,
                phoneNumber: user.phoneNumber || ''
            }
        });

    } catch (error) {
        console.error("VERIFY_OTP_ERROR:", error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

module.exports = {
    LoginControllerAPI,
    VerifyOTPControllerAPI
};