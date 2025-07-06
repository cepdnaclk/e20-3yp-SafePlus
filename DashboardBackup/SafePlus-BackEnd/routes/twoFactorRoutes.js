const express = require('express');
const {
  generate2FASecret,
  verify2FACode,
  enable2FA,
  disable2FA,
  get2FAStatus
} = require('../controllers/twoFactorController');

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


// 2FA routes
router.get('/2fa/status', get2FAStatus);
router.post('/2fa/generate', generate2FASecret);
router.post('/2fa/verify', verify2FACode);
router.post('/2fa/enable', enable2FA);
router.post('/2fa/disable', disable2FA);

module.exports = router;
