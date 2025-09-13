const crypto = require('crypto');

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate OTP expiry time (10 minutes from now)
 * @returns {Date} OTP expiry time
 */
const generateOTPExpiry = () => {
    return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

/**
 * Check if OTP is valid and not expired
 * @param {string} storedOTP - OTP stored in database
 * @param {Date} storedExpiry - OTP expiry time from database
 * @param {string} providedOTP - OTP provided by user
 * @returns {boolean} true if OTP is valid and not expired
 */
const verifyOTP = (storedOTP, storedExpiry, providedOTP) => {
    if (!storedOTP || !storedExpiry || !providedOTP) {
        return false;
    }

    // Check if OTP matches
    if (storedOTP !== providedOTP) {
        return false;
    }

    // Check if OTP is expired
    const now = new Date();
    const expiry = new Date(storedExpiry);
    
    return now <= expiry;
};

/**
 * Clear OTP fields from user object
 * @param {Object} user - Mongoose user document
 * @param {string} type - 'email' or 'password'
 */
const clearOTP = (user, type) => {
    if (type === 'email') {
        user.emailOtp = undefined;
        user.emailOtpExpires = undefined;
    } else if (type === 'password') {
        user.passwordResetOtp = undefined;
        user.passwordResetOtpExpires = undefined;
    }
};

module.exports = {
    generateOTP,
    generateOTPExpiry,
    verifyOTP,
    clearOTP
};