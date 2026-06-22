import nodemailer from 'nodemailer';

/**
 * Create nodemailer transporter LAZILY so it reads env vars
 * after dotenv.config() has already executed in index.js.
 * Gmail app passwords must have NO spaces.
 */
const getTransporter = () => {
    const user = process.env.EMAIL_USER;
    const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, ''); // strip spaces from app password

    if (!user || !pass) {
        throw new Error(`Email credentials not configured. EMAIL_USER="${user}", EMAIL_PASS="${pass ? '***' : 'undefined'}"`);
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
    });
};

/**
 * Generate a cryptographically simple 6-digit OTP
 */
export const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send an OTP email for email verification on registration
 */
export const sendVerificationOtpEmail = async (toEmail, userName, otp) => {
    const mailOptions = {
        from: `"CryptoSuggest" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: '🔐 Your CryptoSuggest Email Verification Code',
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
        </head>
        <body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Arial,sans-serif;">
            <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.08);">
                <!-- Header -->
                <div style="background:linear-gradient(135deg,#3b82f6,#6366f1);padding:32px 40px;text-align:center;">
                    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">🚀 CryptoSuggest</h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Trusted Crypto Platform Reviews</p>
                </div>
                <!-- Body -->
                <div style="padding:40px;">
                    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;">Hi ${userName}! 👋</h2>
                    <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
                        You just registered on <strong>CryptoSuggest</strong>. To activate your account, please enter the verification code below in the app:
                    </p>
                    <!-- OTP Box -->
                    <div style="background:linear-gradient(135deg,#eff6ff,#eef2ff);border:2px dashed #93c5fd;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
                        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#6366f1;letter-spacing:2px;text-transform:uppercase;">Your Verification Code</p>
                        <div style="font-size:44px;font-weight:900;letter-spacing:10px;color:#1d4ed8;font-family:monospace;">${otp}</div>
                        <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">⏰ This code expires in <strong>10 minutes</strong></p>
                    </div>
                    <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:12px;padding:14px 16px;margin-bottom:28px;">
                        <p style="margin:0;font-size:13px;color:#92400e;">⚠️ <strong>Security Notice:</strong> Never share this code with anyone. CryptoSuggest will never ask for it.</p>
                    </div>
                    <p style="margin:0;color:#94a3b8;font-size:13px;">If you didn't register on CryptoSuggest, you can safely ignore this email.</p>
                </div>
                <!-- Footer -->
                <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#94a3b8;">© 2025 CryptoSuggest · Trusted Crypto Platform Reviews</p>
                </div>
            </div>
        </body>
        </html>
        `
    };

    await getTransporter().sendMail(mailOptions);
};

/**
 * Send an OTP email for password reset
 */
export const sendPasswordResetOtpEmail = async (toEmail, userName, otp) => {
    const mailOptions = {
        from: `"CryptoSuggest" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: '🔑 Your CryptoSuggest Password Reset Code',
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
        </head>
        <body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Arial,sans-serif;">
            <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.08);">
                <!-- Header -->
                <div style="background:linear-gradient(135deg,#ef4444,#f97316);padding:32px 40px;text-align:center;">
                    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">🚀 CryptoSuggest</h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Password Reset Request</p>
                </div>
                <!-- Body -->
                <div style="padding:40px;">
                    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;">Hi ${userName}! 🔒</h2>
                    <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
                        We received a request to reset your <strong>CryptoSuggest</strong> password. Enter the OTP below to proceed:
                    </p>
                    <!-- OTP Box -->
                    <div style="background:linear-gradient(135deg,#fff1f2,#fff7ed);border:2px dashed #fca5a5;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
                        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#f97316;letter-spacing:2px;text-transform:uppercase;">Password Reset Code</p>
                        <div style="font-size:44px;font-weight:900;letter-spacing:10px;color:#dc2626;font-family:monospace;">${otp}</div>
                        <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">⏰ This code expires in <strong>15 minutes</strong></p>
                    </div>
                    <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:12px;padding:14px 16px;margin-bottom:28px;">
                        <p style="margin:0;font-size:13px;color:#92400e;">⚠️ <strong>Security Notice:</strong> If you didn't request a password reset, your account may be at risk. Please change your password immediately.</p>
                    </div>
                    <p style="margin:0;color:#94a3b8;font-size:13px;">This code was requested from your registered account. If this wasn't you, please ignore this email.</p>
                </div>
                <!-- Footer -->
                <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#94a3b8;">© 2025 CryptoSuggest · Trusted Crypto Platform Reviews</p>
                </div>
            </div>
        </body>
        </html>
        `
    };

    await getTransporter().sendMail(mailOptions);
};
