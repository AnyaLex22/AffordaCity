const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../email');

const router = express.Router();

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;   // 24h
const RESET_TTL_MS = 60 * 60 * 1000;         // 1h

function newToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ----- Register -----
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const verificationToken = newToken();
    const user = new User({
      name,
      email,
      password,
      isVerified: false,
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + VERIFY_TTL_MS),
    });
    await user.save();

    await sendVerificationEmail(req, user, verificationToken);

    res.status(201).json({
      message: 'Account created. Please check your email to verify your account before logging in.',
    });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// ----- Verify email -----
router.get('/verify-email', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ message: 'Missing token' });
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or already-used verification link.' });
    }
    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      return res.status(400).json({ message: 'Verification link has expired. Please register again.' });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.error('Verify failed:', err);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't leak whether the email exists
      return res.json({ message: 'If that account exists, a new verification email has been sent.' });
    }
    if (user.isVerified) {
      return res.json({ message: 'Account is already verified. Please log in.' });
    }
    user.verificationToken = newToken();
    user.verificationTokenExpires = new Date(Date.now() + VERIFY_TTL_MS);
    await user.save();
    await sendVerificationEmail(req, user, user.verificationToken);
    res.json({ message: 'Verification email resent.' });
  } catch (err) {
    console.error('Resend failed:', err);
    res.status(500).json({ message: 'Could not resend verification email' });
  }
});

// ----- Login -----
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ----- Forgot password -----
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return generic success to avoid email enumeration
    if (user) {
      user.resetPasswordToken = newToken();
      user.resetPasswordExpires = new Date(Date.now() + RESET_TTL_MS);
      await user.save();
      await sendResetPasswordEmail(req, user, user.resetPasswordToken);
    }
    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password failed:', err);
    res.status(500).json({ message: 'Could not send reset email' });
  }
});

// ----- Reset password -----
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Token and password required' });
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // If they confirmed via reset link, treat their email as verified too
    user.isVerified = true;
    await user.save();
    res.json({ message: 'Password updated. You can now log in.' });
  } catch (err) {
    console.error('Reset failed:', err);
    res.status(500).json({ message: 'Could not reset password' });
  }
});

module.exports = router;
