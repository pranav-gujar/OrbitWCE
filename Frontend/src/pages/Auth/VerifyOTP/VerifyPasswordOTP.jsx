import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../AuthContext/AuthContext';
import { showSuccess, showError } from "../../../utils/toast"
import { resetPasswordSchema } from '../../../utils/validationSchemas';

const VerifyPasswordOTP = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();
    const { handleSubmit } = useAuth();
  

    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
            return;
        }

        // Countdown timer for resend button
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [email, navigate]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            e.target.previousSibling.focus();
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            showError('Please enter a valid 6-digit OTP');
            return;
        }

        // For password reset, we just verify the OTP is valid
        // The actual password reset will happen in the next step
        setShowPasswordForm(true);
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        
        const validation = resetPasswordSchema.validate({
            password,
            confirmPassword
        });

        if (validation.error) {
            showError(validation.error.details[0].message);
            return;
        }

        setLoading(true);

        try {
            const result = await handleSubmit('/reset-password', {
                email,
                otp: otp.join(''),
                password
            });

            if (result.message) {
                showSuccess('Password reset successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                throw new Error(result.message || 'Password reset failed');
            }
        } catch (error) {
            showError(error.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setResendLoading(true);
        
        try {
            const result = await handleSubmit('/forget-password', {
                email
            });

            if (result.message) {
                showSuccess('New OTP sent to your email');
                setCountdown(60); // Reset countdown
                setOtp(['', '', '', '', '', '']); // Clear OTP fields
                setShowPasswordForm(false); // Reset to OTP verification
            }
        } catch (error) {
            showError(error.message || 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    if (showPasswordForm) {
        return (
            <div className="w-full flex items-center justify-center p-4 min-h-screen bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Reset Password
                        </h2>
                        <p className="text-gray-600">
                            Create a new password for your account
                        </p>
                    </div>

                    <form onSubmit={handlePasswordReset} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <button
                            onClick={() => setShowPasswordForm(false)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Back to OTP verification
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex items-center justify-center p-4 min-h-screen bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Reset Password
                    </h2>
                    <p className="text-gray-600">
                        Enter the 6-digit code sent to {email}
                    </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <div className="flex justify-center space-x-2">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                className="w-12 h-12 text-center text-2xl border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                value={data}
                                onChange={e => handleChange(e.target, index)}
                                onKeyDown={e => handleKeyDown(e, index)}
                                onFocus={e => e.target.select()}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={otp.join('').length !== 6}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
                    >
                        Verify OTP
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-gray-600 mb-2">
                        Didn't receive the code?
                    </p>
                    <button
                        onClick={handleResendOTP}
                        disabled={resendLoading || countdown > 0}
                        className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        {resendLoading ? 'Sending...' : 
                         countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                    </button>
                </div>

                <div className="text-center mt-4">
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        Back to Forgot Password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyPasswordOTP;