const User = require("../models/User");
const LoginActivity = require('../models/LoginActivity');
const speakeasy = require("speakeasy");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require('../helpers/auth');

// Signup endpoint
const register = async (req, res) => {
  try {
    const { fname, name, email, password } = req.body;

    if (!fname) return res.json({ error: 'Full name is required' });
    if (!name) return res.json({ error: 'Username is required' });
    if (!password || password.length < 6) return res.json({ error: 'Password must be at least 6 characters' });

    const existingUserByName = await User.findOne({ name });
    if (existingUserByName) return res.json({ error: 'Username is already taken' });

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) return res.json({ error: 'Email is already taken' });

    const hashedPassword = await hashPassword(password);

    const user = await User.create({ fname, name, email, password: hashedPassword });

    return res.json(user);
  } catch (error) {
    console.log("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

// Login endpoint
const login = async (req, res) => {
  try {
    const ip = req.clientIp;
    const { name, password } = req.body;

    console.log("Login API hit");

    const user = await User.findOne({ name });
    if (!user) return res.json({ error: 'No User Found' });

    const match = await comparePassword(password, user.password);
    if (!match) return res.json({ error: 'Password does not match' });

    if (user.is2FAEnabled) {
      return res.json({
        requires2FA: true,
        userId: user._id,
        name: user.name,
      });
    }

    jwt.sign(
      { email: user.email, id: user._id, name: user.name },
      process.env.JWT_SECRET,
      {},
      async (err, token) => {
        if (err) {
          console.error("JWT Sign error:", err);
          return res.status(500).json({ error: "Token generation failed" });
        }

        await LoginActivity.create({
          userId: user._id,
          timestamp: new Date(),
          ip,
          userAgent: req.headers['user-agent'],
        });

        res.cookie('token', token, {
          httpOnly: true,
          sameSite: 'None',
          secure: true,
        }).json({
          token,
          username: user.name,
        });
      }
    );
  } catch (error) {
    console.log("Unexpected error in login route:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 2FA Verification
const verify2FA = async (req, res) => {
  try {
    const ip = req.clientIp;
    const { userId, totpCode } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.is2FAEnabled || !user.twoFASecret)
      return res.status(400).json({ error: "2FA not enabled for this user" });

    const isValid = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token: totpCode.trim(),
      window: 4,
    });

    if (!isValid) return res.status(400).json({ error: "Invalid or expired 2FA code" });

    jwt.sign(
      { email: user.email, id: user._id, name: user.name },
      process.env.JWT_SECRET,
      {},
      async (err, token) => {
        if (err) {
          console.error("JWT Sign error:", err);
          return res.status(500).json({ error: "Token generation failed" });
        }

        await LoginActivity.create({
          userId: user._id,
          timestamp: new Date(),
          ip,
          userAgent: req.headers['user-agent'],
        });

        res.cookie("token", token, {
          httpOnly: true,
          sameSite: 'None',
          secure: true,
        }).json({
          success: true,
          token,
          username: user.name,
        });
      }
    );
  } catch (err) {
    console.error("Error in /verify-2fa:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get login history
const getLoginActivities = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const activities = await LoginActivity.find({ userId: decoded.id })
      .sort({ timestamp: -1 })
      .limit(20);

    res.status(200).json(activities);
  } catch (err) {
    console.error('Error fetching login activities:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Token verification and user info
const test = (req, res) => {
  res.json('test is working');
};

// Get current logged-in user's profile
const getProfile = (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.json(null);

  try {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
      if (err) {
        console.error("Token verification failed:", err);
        return res.status(401).json(null);
      }
      res.json(user);
    });
  } catch (err) {
    console.error("Error in getProfile:", err);
    res.status(500).json(null);
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { fname, name, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { fname, name, email },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({
      fname: updatedUser.fname,
      name: updatedUser.name,
      email: updatedUser.email,
      id: updatedUser._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed' });
  }
};

// Get profile by username
const getProfilebyname = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ name: username }).select('-password');
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { token } = req.cookies;
    const { currentPassword, newPassword } = req.body;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();
    res.status(200).json({ message: 'Password changed successfully' });

  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const deleted = await User.findByIdAndDelete(decoded.id);

    if (!deleted) return res.status(404).json({ message: 'User not found or already deleted' });

    res.clearCookie('token');
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export
module.exports = {
  register,
  login,
  test,
  getProfile,
  updateProfile,
  getProfilebyname,
  changePassword,
  deleteAccount,
  getLoginActivities,
  verify2FA
};
