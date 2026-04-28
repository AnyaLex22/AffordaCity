const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 587,
  secure: false,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY,
  },
});

function getBaseUrl(req) {
  return process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
}

async function sendVerificationEmail(req, user, token) {
  const url = `${getBaseUrl(req)}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: 'Verify your Affordacity email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; background: #f5f7fa; border-radius: 8px;">
        <h2 style="color: #2e3a4d;">Welcome to Affordacity, ${user.name}!</h2>
        <p>Please verify your email address to activate your account.</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #4e73df; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Verify Email
        </a>
        <p style="margin-top: 16px; font-size: 13px; color: #888;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
}

async function sendResetPasswordEmail(req, user, token) {
  const url = `${getBaseUrl(req)}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: 'Reset your Affordacity password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; background: #f5f7fa; border-radius: 8px;">
        <h2 style="color: #2e3a4d;">Password Reset Request</h2>
        <p>Hi ${user.name}, click below to reset your password.</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #4e73df; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Reset Password
        </a>
        <p style="margin-top: 16px; font-size: 13px; color: #888;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail, sendResetPasswordEmail };