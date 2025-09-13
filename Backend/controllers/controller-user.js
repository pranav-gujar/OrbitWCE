const User = require("../models/User");
const crypto = require('crypto')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require("../utils/sendEmail/sendEmail");
const { generateOTP, generateOTPExpiry, clearOTP } = require("../utils/otpService");

const userRegistration = async (req, res) => {
    try {

        const { name, email, password, role = 'user', isVerified, resetPasswordToken, resetPasswordExpires } = req.body;
        
        console.log('Registration request received with role:', role);
        console.log('Request body:', req.body);

        // check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                message: 'User already exists!'
            });
        }

        // Hash password 
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Generate OTP for email verification
        const emailOtp = generateOTP();
        const emailOtpExpires = generateOTPExpiry();


        // Create User 

        console.log('Creating user with role:', role);
        
        // Create user with explicit role assignment
        const userData = {
            name,
            email,
            password: hashPassword,
            role: role || 'user', // Ensure role is set, default to 'user' if not provided
            isVerified: false, // Always start as not verified
            emailOtp,
            emailOtpExpires,
            resetPasswordToken: null,
            resetPasswordExpires: null
        };
        
        console.log('Creating user with data:', JSON.stringify(userData, null, 2));
        
        user = new User(userData);

        console.log('User object before save:', user);
        
        await user.save();
        
        // Fetch the user again to ensure we have the latest data
        const savedUser = await User.findById(user._id);
        console.log('User after save:', savedUser);
        
        if (!savedUser) {
            throw new Error('Failed to save user');
        }
        
        // Log the saved user data
        console.log('User role after save:', savedUser.role);
        console.log('Is user a community?', savedUser.role === 'community');

        // Email content with OTP
        const emailContent = `
            <h2>Email Verification</h2>
            <p>Your verification code is: <strong>${emailOtp}</strong></p>
            <p>This code will expire in 10 minutes.</p>
            <p>Please enter this code on the verification page to complete your registration.</p>
        `;

        // Send Email 
        await sendEmail(user.email, 'Verify Your Email', emailContent);

        // response send client side 
        const responseUser = {
            _id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            role: savedUser.role,
            isVerified: savedUser.isVerified
        };
        
        
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email for OTP verification',
            user: responseUser,
            requiresVerification: true
        });



    } catch (error) {

        res.status(500).json({
            message: 'Server error!'
        })

    }
};



const userLogin = async (req, res) => {
    try {

        const { email, password } = req.body;

        // check if user exists 
        const user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(401).json({
                message: 'Please verify your email before logging in',
                isVerified: false
            });
        }

        // compare password 
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid email or password'
            })
        };


        // Generate JWT token with user role
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email,
                role: user.role || 'user'  // Include the user's role in the token
            }, 
            process.env.ACCESS_TOKEN, 
            { expiresIn: '1h' }
        );


        // Send token as a cookie 
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            samesite: 'strict'
        }).status(200).json({
            message: 'Login successfully',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
                role: user.role || 'user'  // Include the user's role, default to 'user' if not set
            }
        });


    } catch (error) {
        res.status(500).json({
            message: 'Server error!'
        })
    }
};

const userPasswordForget = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists 
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'User not found!'
            })
        };

        // Generate OTP for password reset
        const passwordResetOtp = generateOTP();
        const passwordResetOtpExpires = generateOTPExpiry();

        // Store the OTP in the user's database record (temporary)
        user.passwordResetOtp = passwordResetOtp;
        user.passwordResetOtpExpires = passwordResetOtpExpires;

        await user.save();

        // Email content with OTP
        const emailContent = `
            <h2>Password Reset Request</h2>
            <p>Your password reset code is: <strong>${passwordResetOtp}</strong></p>
            <p>This code will expire in 10 minutes.</p>
            <p>Please enter this code on the password reset page to reset your password.</p>
        `;

        // Send Email 
        await sendEmail(user?.email, 'Password reset Request', emailContent);


        res.status(200).json({
            message: 'Password reset OTP sent to your email',
            requiresOtp: true
        })





    } catch (error) {
        res.status(500).json({
            message: 'Server error!'
        })
    }
};


const userPasswordReset = async (req, res) => {
    try {

        const { email, otp, password } = req.body;

        // Find user by email and check if OTP is valid
        const user = await User.findOne({
            email,
            passwordResetOtp: otp,
            passwordResetOtpExpires: { $gt: Date.now() } // Ensure OTP is not expired
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired OTP'
            })
        };


        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);


        // Clear OTP fields
        user.passwordResetOtp = undefined;
        user.passwordResetOtpExpires = undefined;

        // save the new password 
        await user.save();

        res.status(200).json({
            message: 'Password reset successful',
            user
        });

    } catch (error) {
        res.status(500).json({
            message: 'Server error!'
        })
    }
};



const userVerifyEmail = async (req, res) => {
    try {

        const { email, otp } = req.body;

        // Find user by email and check if OTP is valid
        const user = await User.findOne({
            email,
            emailOtp: otp,
            emailOtpExpires: { $gt: Date.now() } // Ensure OTP is not expired
        });
        
        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired OTP'
            })
        };

        //Mark user as verified
        user.isVerified = true;
        user.emailOtp = undefined;
        user.emailOtpExpires = undefined;

        await user.save();

        // Create a sanitized user object without sensitive data
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified
        };

        res.status(200).json({
            message: 'Email verified successfully',
            user: userResponse,
            status: 200
        });


    } catch (error) {
        res.status(500).json({
            message: 'Server error!'
        })
    }
};

const resendEmailOTP = async (req, res) => {
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

        // Generate new OTP
        const emailOtp = generateOTP();
        const emailOtpExpires = generateOTPExpiry();
        
        user.emailOtp = emailOtp;
        user.emailOtpExpires = emailOtpExpires;
        await user.save();

        // Email content
        const emailContent = `
            <h2>Email Verification</h2>
            <p>Your new verification code is: <strong>${emailOtp}</strong></p>
            <p>This code will expire in 10 minutes.</p>
            <p>Please enter this code on the verification page to complete your registration.</p>
        `;

        // Send Email
        await sendEmail(user.email, 'Verify Your Email - New Code', emailContent);

        // Response
        res.status(200).json({
            message: 'New verification code has been sent. Please check your inbox.'
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            message: 'Server error!'
        });
    }
};




const userLogout = async (req, res) => {
    try {

        res.clearCookie('token',
            // optional
            {
                httpOnly: true,
                secure: false,
                samesite: 'strict'
            }
        );

        res.status(200).json({
            message: 'Logged out successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Server error!'
        })
    }
}



module.exports = {
    userRegistration,
    userLogin,
    userPasswordForget,
    userPasswordReset,
    userVerifyEmail,
    resendEmailOTP,
    userLogout
};