const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const AppError = require('../utils/AppError.js');
const User = require('../models/user.js');
const {generateAccessToken, generateRefreshToken} = require('../utils/generateToken.js');
/* const speakeasy = require("speakeasy"); */
const sendOTP = require("../config/email.js");

// register user
const registerUser = asyncHandler(async (req, res, next) =>{
    try {
        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return next(new AppError("All Fields are required", 400));
        }
    
        const userExists = await User.findOne({email});
        if(userExists){
            return next(new AppError("Email already registered", 400));
        }
    
        const newuser = await User.create({name, email, password});

        const accessToken = generateAccessToken(newuser._id, res);
        const refreshToken = generateRefreshToken(newuser._id, res);

        newuser.refreshTokens.push({token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}); // 7 days expiry
        await newuser.save();
        res.status(201).json({
            success: true,
            user: {
                name: newuser.name,
                email: newuser.email,
            },
            message: `${newuser.name} signed up successfully. `
        });
    } catch (error) {
        res.status(500).json({success: false, message: error.message});   
    }
})

// get user by ID
const loginUser = asyncHandler(async(req, res, next) =>{
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user || !(await user.matchPassword(password))){
        return next(new AppError("Invalid email or password", 401));
    }


    // Generates OTP
    /* const otp = speakeasy.totp({
        secret: process.env.OTP_SECRET,
        digits: 6,
        step: 300, // 5 minutes validity
    }); */

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    
    user.twoFactorCode = otp;
    user.twoFactorExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    // send otp via mail
    await sendOTP(email, otp);
    
    
    res.status(200).json({
        success: true,
        message: "OTP sent to your email"
    })
});


// forgot password
//step 1: User forgot password,  reset it by asking via email
const forgotPassword = asyncHandler(async(req, res, next) =>{
    try {
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return next(new AppError("User with this email does not exist", 401));
        }
        
        // Generates OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
        await user.save();
        await sendOTP(email, otp);
    
        res.status(200).json({
            success: true,
            message: "OTP sent to your email",
        });
    } catch (error) {
        return next(new AppError(error || "Error while sending OTP", 401));
    }
});

// step 2: User submits OTP, receives JWT on success
const verifyForgotPasswordOTP = asyncHandler(async(req, res, next) =>{
    try {
        const {email, otp} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return next(new AppError("User with this email does not exist", 401));
        }
        if (!user.resetPasswordOTP || Date.now() > user.resetPasswordOTPExpiry) {
            return next(new AppError("OTP expired, please try again", 401));
        }

        if (user.resetPasswordOTP !== otp) {
            return next(new AppError("Invalid OTP", 401));
        }

        // generates a one time password reset token
        const resetToken = jwt.sign({userId: user._id}, process.env.JWT_RESET_PASSWORD_SECRET, {expiresIn: "15m"});
    
        // Clear OTP after successful verification
        user.resetPasswordOTP = null;
        user.resetPasswordOTPExpiry = null;
    
        res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            resetToken, // send this token to the user for password reset
        });
    } catch (error) {
        return next(new AppError(error || "Error while verifying OTP", 401));
    }
})

// step 3: User resets password using the reset token
const resetPassword = asyncHandler(async(req, res, next) =>{
    try {
        const {newPassword, token} = req.body;
        if(!newPassword || !token){
            return next(new AppError("All fields are required", 400));
        }
        // verify the token
        const decoded = jwt.verify(token, process.env.JWT_RESET_PASSWORD_SECRET);
        if(!decoded || !decoded.userId){
            return next(new AppError("Invalid or expired token", 401));
        }

        // find the user and update password
        const user = await User.findById(decoded.userId);
        if(!user){
            return next(new AppError("User not found", 404));
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        return next(new AppError(error || "Error while resetting password", 401));
    }
})



// User submits OTP, receives JWT on success
const verifyOTP = asyncHandler(async(req, res, next) =>{
    try {
        const {email, otp} = req.body;
        const user = await User.findOne({email});
    
        if(!user){
            return next(new AppError("User not found", 401));
        }
        if (!user.twoFactorCode || Date.now() > user.twoFactorExpiry) {
            return next(new AppError("OTP expired, please log in again", 401));
        }

        if (user.twoFactorCode !== otp) {
            return next(new AppError("Invalid OTP", 401));
        }
    
        // Clear OTP after successful verification
        user.twoFactorCode = null;
        user.twoFactorExpiry = null;
    
        const accessToken = generateAccessToken(user._id, res);
        const refreshToken = generateRefreshToken(user._id, res);
        user.refreshTokens.push({token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)});
        await user.save();



        return res
        .status(200)
        .json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
            },
            token: accessToken,
            message: "User login successfully",
        })

        
    } catch (error) {
        return next(new AppError("Error while verifying OTP", 401));
    }

})

// Refresh Access Token
const refreshAccessToken = asyncHandler(async (req, res, next) =>{
    try {
        let {refreshToken} = req.cookies || req.body;
        if (!refreshToken) {
            return next(new AppError("Unauthorized request", 403));
        }

        // 1. verify the incoming refresh token with existing one 
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        if(!decoded || !decoded.userId){
            return next(new AppError("Invalid refresh token", 403));
        }

        // 2. find the user in dB
        const user = await User.findById(decoded.userId);

        


        if(!user){
            return next(new AppError("User not found", 404));
        }

        // 3.check if refresh token exists in user's stored db 
        const refreshTokenExist = user.refreshTokens.find((foundToken) =>{
            return foundToken.token === refreshToken;
        });

        if(!refreshTokenExist){
            return next(new AppError("Refresh token not recognized", 403));
        }
        // 4. Now remove the used refresh token and generate a new refresh token as well
        // remove
        user.refreshTokens = user.refreshTokens.filter((refreshtoken) => refreshtoken.token !== refreshToken);

        // generate a new refresh and new Access tokens as well
        const newRefreshToken = generateRefreshToken(user._id, res);
        const newAccessToken = generateAccessToken(user._id, res);
        // push newRefreshToken into DB
        user.refreshTokens.push({token: newRefreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)});

        const responseuser = await user.save();





        return res.status(200).json({
            success: true,
            user,
            token: newAccessToken,
            message: "new Access Token Generated Successfully",
        });
    } catch (error) {
        res.status(500).json({success: false, message: error.message});   
/*         return next(new AppError("Some error occured while refreshing new Access Token", 403)) */

    }
});

//  Get User Profile (Protected)
const getProfile = asyncHandler(async(req, res) =>{
    res.json({
        success: true,
        user: req.user,
    });
    console.log("User authenticated successfully");
});

// Logout User
const logout = asyncHandler(async (req, res, next) =>{
    await User.findByIdAndUpdate(
        req.user.userId, 
        {
            $set:{
                refreshTokens: [],
            }
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshTokens", options)
    .json({
        success: true,
        message: "User logout successfully",
    })
})



module.exports = {registerUser, loginUser, getProfile, refreshAccessToken, logout, verifyOTP, forgotPassword, verifyForgotPasswordOTP, resetPassword};