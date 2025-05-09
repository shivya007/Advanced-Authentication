const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "make another unique password"],
        unique: true,
    },
    resetPasswordOTP: String,
    resetPasswordOTPExpiry: Date,

    refreshTokens:[{
        token: String,
        expiresAt: Date,
    }],

    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    twoFactorCode: String, // stores OTP
    twoFactorExpiry: Date, // expiry time (5 min)

}, {timestamps: true});



// Hash password before saving user

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password for login

userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}


const User = mongoose.model("User", userSchema);

module.exports = User;