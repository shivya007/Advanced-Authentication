const jwt = require('jsonwebtoken');


// Generate Access Token (Short Expiry)

const generateAccessToken = (userId, res) =>{
    const token = jwt.sign({userId}, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "15m",
    });

    res.cookie("accessToken", token, {
        maxAge: 15 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
    });



    return token;
};


// Generate Refresh Token (Long Expiry)

const generateRefreshToken = (userId, res) =>{
    const token = jwt.sign({userId}, process.env.JWT_REFRESH_SECRET, { 
        expiresIn: "7d",
    });

    res.cookie("refreshToken", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
    });

    return token;
}



module.exports = {generateAccessToken, generateRefreshToken};