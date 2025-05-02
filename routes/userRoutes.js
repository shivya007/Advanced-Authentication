const express = require('express');
const {loginUser,registerUser, getProfile, refreshAccessToken, logout, verifyOTP} = require('../controllers/userController.js');
const router = express.Router();
const {protect} = require("../Middlewares/authMiddleware.js");
const { loginLimiter } = require('../Middlewares/rateLimiter.js');


router.post("/register", registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/verify-otp", verifyOTP);
router.get("/profile", protect, getProfile);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", protect, logout);
module.exports = router;