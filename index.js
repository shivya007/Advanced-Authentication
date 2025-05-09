require("dotenv").config();
const express = require('express');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db.js')
const app = express();
const userRoutes = require('./routes/userRoutes.js');
const blogRoutes = require('./routes/blogRoutes.js');
const errorHandler = require('./Middlewares/errorHandler.js');
const AppError = require("./utils/AppError.js");
connectDB();

app.use(express.json());
app.use(cookieParser());

const options = {
    origin: "https://advanced-auth-nine.vercel.app",          
    credentials: true,
}
app.use(cors(options));





app.use('/api/users', userRoutes);

app.all("*", (req, res, next) =>{
    next(new AppError(`can't find the${decodeURIComponent(req.originalUrl)} on the server!`, 404));
})

app.use(errorHandler);


const port = process.env.port || 5000;
app.listen(port, () =>{
    console.log("Server is listening on port: ", port);
});