const mongoose = require('mongoose');

const connectDB = () =>{
    try {
        mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.log("DataBase Connection is Failed:", error);
        process.exit(1);
    }
}

module.exports = connectDB;