const nodemailer = require('nodemailer');

// purpose: 'login' (default) | 'change-password' | 'forgot-password'
const sendOTPEmail = async (email, otp, purpose = 'login') => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const emailContent = {
        'login': {
            subject: 'Your Secure Login OTP - AgroIntel AI',
            heading: 'Secure Login Verification',
            description: 'Thank you for logging in to <strong>AgroIntel AI</strong>. Please use the One-Time Password (OTP) below to complete your secure login process:',
            warning: 'If you did not attempt to log in, please ignore this email or contact our support team immediately.'
        },
        'change-password': {
            subject: 'Password Change Request - AgroIntel AI',
            heading: 'Password Change Verification',
            description: 'We received a request to <strong>change your account password</strong> on <strong>AgroIntel AI</strong>. Please use the One-Time Password (OTP) below to verify this change:',
            warning: 'If you did not request a password change, please secure your account immediately by logging in and changing your password, or contact our support team.'
        },
        'forgot-password': {
            subject: 'Password Reset Request - AgroIntel AI',
            heading: 'Password Reset Verification',
            description: 'We received a request to <strong>reset your forgotten password</strong> on <strong>AgroIntel AI</strong>. Please use the One-Time Password (OTP) below to verify your identity and reset your password:',
            warning: 'If you did not request a password reset, you can safely ignore this email. Your account password will remain unchanged.'
        }
    };

    const content = emailContent[purpose] || emailContent['login'];

    const mailOptions = {
        from: '"AgroIntel AI" <noreply@agrointel.com>',
        to: email,
        subject: content.subject,
        html: `
    <div style="margin:0;padding:0;background-color:#f4f7f9;font-family:Arial,Helvetica,sans-serif;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr>
                <td style="background-color:#16a34a;padding:20px;text-align:center;color:#ffffff;">
                    <h2 style="margin:0;">AgroIntel AI</h2>
                    <p style="margin:5px 0 0;font-size:14px;">Smart Agriculture Intelligence Platform</p>
                </td>
            </tr>

            <!-- Purpose Banner -->
            <tr>
                <td style="background-color:#f0fdf4;padding:12px 30px;border-bottom:1px solid #dcfce7;">
                    <p style="margin:0;font-size:14px;font-weight:bold;color:#16a34a;text-align:center;">
                        🔐 ${content.heading}
                    </p>
                </td>
            </tr>

            <!-- Body -->
            <tr>
                <td style="padding:30px;">
                    <p style="font-size:16px;color:#333;margin-bottom:10px;">
                        Hello,
                    </p>

                    <p style="font-size:15px;color:#555;line-height:1.6;">
                        ${content.description}
                    </p>

                    <!-- OTP Box -->
                    <div style="margin:25px 0;text-align:center;">
                        <span style="display:inline-block;padding:15px 25px;
                            font-size:28px;
                            font-weight:bold;
                            letter-spacing:6px;
                            color:#16a34a;
                            background-color:#f0fdf4;
                            border:2px dashed #16a34a;
                            border-radius:8px;">
                            ${otp}
                        </span>
                    </div>

                    <p style="font-size:14px;color:#666;">
                        ⏳ This OTP is valid for <strong>5 minutes</strong>. 
                        Please do not share this code with anyone.
                    </p>

                    <p style="font-size:14px;color:#666;line-height:1.6;">
                        ${content.warning}
                    </p>

                    <p style="margin-top:25px;font-size:15px;color:#333;">
                        Best Regards,<br>
                        <strong>AgroIntel AI Security Team</strong>
                    </p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="background-color:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#888;">
                    © ${new Date().getFullYear()} AgroIntel AI. All rights reserved.
                </td>
            </tr>

        </table>
    </div>
    `
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };