const rateLimit = require("express-rate-limit");

// Rate Limit for Login Attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit to 5 login attempts per IP
    message: { success: false, message: "Too many login attempts, please try again after 15 min." }
});

module.exports = { loginLimiter };