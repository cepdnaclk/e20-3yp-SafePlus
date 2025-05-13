const express = require('express');
const { test, register, login, getProfile } = require('../controllers/authController')
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
router.get('/profile', getProfile)


module.exports = router