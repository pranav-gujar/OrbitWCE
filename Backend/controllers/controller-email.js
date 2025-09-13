const User = require("../models/User");
const crypto = require('crypto');
const sendEmail = require("../utils/sendEmail/sendEmail");

const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: 'User not found!'
            });
        }

        // Check if user is already verified
        if (user.isVerified) {
            return res.status(400).json({
                message: 'Email is already verified!'
            });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        await user.save();

        // Create verification link
        const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

        // Email content
        const emailContent = `
            <h2>Email Verification</h2>
            <p>Click the link below to verify your email:</p>
            <a href="${verificationLink}" target="_blank">${verificationLink}</a>
        `;

        // Send Email
        await sendEmail(user.email, 'Verify Your Email', emailContent);

        // Response
        res.status(200).json({
            message: 'Verification email has been resent. Please check your inbox.'
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            message: 'Server error!'
        });
    }
};

module.exports = {
    resendVerificationEmail
};