const AppError = require('../utils/AppError.js');

const errorHandler = (error, req, res, next) =>{
    console.log("Error is coming from Global error Handler", error);

    // check Handle invalid MongoDB ObjectId errors (CastError)
    if(error.name === "CastError" && error.kind === "ObjectId"){
        res.status(400).json({
            success: false,
            message: "Invalid user ID. Please provide a valid Id.",
        });
    }

    // check Check if the error is an instance of AppError
    if(error instanceof AppError){
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
}

module.exports = errorHandler;