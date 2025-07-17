const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate and return 2FA secret and QR code
const generate2FASecret = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const secret = speakeasy.generateSecret({
      name: `SafePlus (${user.name})`,
    });

    user.twoFASecret = secret.base32;
    await user.save();

    const qrDataURL = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      qrCode: qrDataURL,
      secret: secret.base32,
    });
  } catch (err) {
    console.error('Generate 2FA error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify the TOTP code submitted by the user
const verify2FACode = async (req, res) => {
  try {
    const { token } = req.cookies;
    const { code } = req.body;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    const isValid = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid code' });
    }

    res.json({ success: true, message: '2FA code is valid' });

  } catch (err) {
    console.error('Verify 2FA error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Enable 2FA for user after successful verification
const enable2FA = async (req, res) => {
  try {
    const { token } = req.cookies;
    const { code } = req.body;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    user.is2FAEnabled = true;
    await user.save();

    res.json({ message: 'Two-factor authentication enabled successfully' });
  } catch (err) {
    console.error('Enable 2FA error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Disable 2FA
const disable2FA = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    user.is2FAEnabled = false;
    user.twoFASecret = undefined;
    await user.save();

    res.json({ message: 'Two-factor authentication disabled successfully' });
  } catch (err) {
    console.error('Disable 2FA error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get 2FA status for current user
const get2FAStatus = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    res.json({ enabled: user.is2FAEnabled || false });
  } catch (err) {
    console.error('Get 2FA status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  generate2FASecret,
  verify2FACode,
  enable2FA,
  disable2FA,
  get2FAStatus,
};
