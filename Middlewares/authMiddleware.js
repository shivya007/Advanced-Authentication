const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const AppError = require('../utils/AppError');
const User = require('../models/user.js');

const protect = asyncHandler(async (req, res, next) =>{
    
    try {
        // get jwt token from its cookies
        console.log("See the request: ", req);
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        console.log("See the token: ", req.cookies?.accessToken);


      
    
        if(!token){
            return next(new AppError("Unauthorized - No Token Provided", 401));
        }
    
        // decode the jwt token
        const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        if(!decodedToken){
            return next(new AppError("Unauthorized - Invalid Token", 401));
        }

    
        // get the user_id from the decodedToken
    
        const existingUser = await User.findById(decodedToken?.userId).select("-password -refreshTokens");
   
        if(!existingUser){
            return next(new AppError("User not found", 401));
        }
    
        // Attach user object to the request;
    
        req.user = existingUser;
        next();

    } catch (error) {
        return next(new AppError("Internal server error", 500));
    }

})

module.exports = {protect};


















