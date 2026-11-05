const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendPasswordResetEmail = async (toEmail, resetUrl) => {
    await transporter.sendMail({
        from: `"EasyBudget" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Reset your EasyBudget password',
        html: `
            <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1e293b; border-radius: 12px; color: #f1f5f9;">
                <h2 style="margin: 0 0 8px; font-size: 22px; color: #f1f5f9;">Reset your password</h2>
                <p style="color: #94a3b8; margin: 0 0 24px; font-size: 15px;">
                    We received a request to reset your EasyBudget password. Click the button below to choose a new one.
                </p>
                <a href="${resetUrl}" style="display: inline-block; padding: 13px 28px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                    Reset Password
                </a>
                <p style="color: #64748b; margin: 24px 0 0; font-size: 13px;">
                    This link expires in <strong style="color: #94a3b8;">1 hour</strong>. If you didn't request this, you can safely ignore this email.
                </p>
            </div>
        `
    });
};

module.exports = { sendPasswordResetEmail };
