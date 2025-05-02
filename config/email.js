const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTP = async (email, otp) =>{
    const mailOptions= {
        from: `"Shiv" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your One-Time Password (OTP)",
        text: `Your OTP for login is: ${otp}. It is valid for 5 minutes.`,
    };



/*     await transporter.sendMail(mailOptions); */

try {
    await transporter.sendMail(mailOptions);
} catch (error) {
    throw new Error( error.response ||"Failed to send OTP email");
}
};

module.exports = sendOTP;