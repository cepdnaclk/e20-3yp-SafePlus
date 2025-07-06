const express = require('express');
const { test, register, login, getProfile,updateProfile, getProfilebyname, changePassword, deleteAccount, getLoginActivities, verify2FA } = require('../controllers/authController')
const router = express.Router();
const cors = require("cors");

// Get allowed origins from environment variable
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim())
  : [];

// Middleware
router.use(
  cors({
    credentials: true,
    origin: function(origin, callback) {
      // Allow requests with no origin (like curl, Postman, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
  })
);


router.get('/', test)
router.post("/register", register);
router.post("/login", login);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/profile/:username', getProfilebyname);
router.put('/change-password', changePassword);
router.delete('/delete-account', deleteAccount);
router.get('/login-activities',getLoginActivities);
router.post("/verify-2fa", verify2FA);

module.exports = router
