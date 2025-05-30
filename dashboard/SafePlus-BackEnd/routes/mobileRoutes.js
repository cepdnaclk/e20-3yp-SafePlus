const express = require("express");
const router = express.Router();
const MobileUser = require("../models/MobileUser"); // create this model
const bcrypt = require("bcryptjs");

// Mobile Signup
router.post("/signup", async (req, res) => {
  console.log("Signup request received"); 
  const { username, email, password } = req.body;

  try {
    const existing = await MobileUser.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new MobileUser({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Mobile Login
router.post("/login", async (req, res) => {
  console.log("Login request received"); 
  const { email, password } = req.body;

  try {
    const user = await MobileUser.findOne({ email:req.body.email });
    console.log("User found:", user); // Debugging line
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", userId: user._id ,username: user.username, email: user.email });
    console.log("Login successful for user:", user.username);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Change Password (Mobile)
router.post("/change-password", async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    const user = await MobileUser.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


module.exports = router;
