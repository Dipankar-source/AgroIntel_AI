const User = require('../../models/User/userData');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendOTPEmail } = require('../../utils/otp/otpService');

// ─── Change Password: Step 1 — Send OTP to logged-in user's email ───
const SendChangePasswordOTP = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, msg: 'Authentication required' });
        }

        const { currentPassword } = req.body;
        if (!currentPassword) {
            return res.status(400).json({ success: false, msg: 'Current password is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, msg: 'Current password is incorrect' });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        user.verificationToken = otp;
        user.resetPasswordExpires = Date.now() + 5 * 60 * 1000;
        await user.save();

        try {
            await sendOTPEmail(user.email, otp, 'change-password');
        } catch (mailError) {
            console.error('Email sending failed:', mailError.message);
            console.log(`⚠️ DEBUG - Change password OTP for ${user.email}: ${otp}`);
        }

        return res.status(200).json({
            success: true,
            msg: 'Verification code sent to your email',
            email: user.email
        });
    } catch (error) {
        console.error('SEND_CHANGE_PASSWORD_OTP_ERROR:', error);
        return res.status(500).json({ success: false, msg: 'Server error' });
    }
};

// ─── Change Password: Step 2 — Verify OTP and set new password ───
const VerifyChangePassword = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, msg: 'Authentication required' });
        }

        const { otp, newPassword } = req.body;
        if (!otp || !newPassword) {
            return res.status(400).json({ success: false, msg: 'OTP and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, msg: 'Password must be at least 6 characters' });
        }

        const user = await User.findOne({
            _id: userId,
            verificationToken: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, msg: 'Invalid or expired OTP' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.verificationToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({ success: true, msg: 'Password changed successfully' });
    } catch (error) {
        console.error('VERIFY_CHANGE_PASSWORD_ERROR:', error);
        return res.status(500).json({ success: false, msg: 'Server error' });
    }
};

// ─── Forgot Password: Step 1 — Send OTP to email (no login required) ───
const SendForgotPasswordOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, msg: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Return success even if user not found to prevent email enumeration
            return res.status(200).json({
                success: true,
                msg: 'If an account with that email exists, a verification code has been sent'
            });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        user.resetPasswordToken = otp;
        user.resetPasswordExpires = Date.now() + 5 * 60 * 1000;
        await user.save();

        try {
            await sendOTPEmail(user.email, otp, 'forgot-password');
        } catch (mailError) {
            console.error('Email sending failed:', mailError.message);
            console.log(`⚠️ DEBUG - Forgot password OTP for ${user.email}: ${otp}`);
        }

        return res.status(200).json({
            success: true,
            msg: 'If an account with that email exists, a verification code has been sent'
        });
    } catch (error) {
        console.error('SEND_FORGOT_PASSWORD_OTP_ERROR:', error);
        return res.status(500).json({ success: false, msg: 'Server error' });
    }
};

// ─── Forgot Password: Step 2 — Verify OTP ───
const VerifyForgotPasswordOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, msg: 'Email and OTP are required' });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordToken: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, msg: 'Invalid or expired OTP' });
        }

        // Generate a short-lived reset token so we know OTP was verified
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min to set new password
        await user.save();

        return res.status(200).json({
            success: true,
            msg: 'OTP verified',
            resetToken
        });
    } catch (error) {
        console.error('VERIFY_FORGOT_PASSWORD_OTP_ERROR:', error);
        return res.status(500).json({ success: false, msg: 'Server error' });
    }
};

// ─── Forgot Password: Step 3 — Reset password with token ───
const ResetPassword = async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;
        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({ success: false, msg: 'Email, reset token, and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, msg: 'Password must be at least 6 characters' });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, msg: 'Invalid or expired reset token' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({ success: true, msg: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        console.error('RESET_PASSWORD_ERROR:', error);
        return res.status(500).json({ success: false, msg: 'Server error' });
    }
};

module.exports = {
    SendChangePasswordOTP,
    VerifyChangePassword,
    SendForgotPasswordOTP,
    VerifyForgotPasswordOTP,
    ResetPassword
};
