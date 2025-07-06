const express = require('express');
const { test, register, login, getProfile,updateProfile, getProfilebyname, changePassword, deleteAccount, getLoginActivities, verify2FA } = require('../controllers/authController')
const router = express.Router();
const cors = require("cors");

//middleware
router.use(
  cors({
    credentials: true,
    origin: 'http://localhost:5173'
  })
)

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