const express = require('express');
const {loginUser,registerUser, getProfile, refreshAccessToken, logout, verifyOTP, forgotPassword, verifyForgotPasswordOTP, resetPassword} = require('../controllers/userController.js');
const router = express.Router();
const {protect} = require("../Middlewares/authMiddleware.js");
const { loginLimiter } = require('../Middlewares/rateLimiter.js');


router.post("/register", registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyForgotPasswordOTP);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verifyOTP);
router.get("/profile", protect, getProfile);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", protect, logout);
module.exports = router;