import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Formik, Form, Field } from 'formik';
import AuthContext from '../../../AuthContext/AuthContext';
import { showSuccess, showError, showInfo } from '../../../utils/toast';
import { loginSchema, validateForm } from '../../../utils/validationSchemas';
import PasswordStrength from '../../../Components/PasswordStrength/PasswordStrength';
import Modal from '../../../Components/Modal/Modal';

const Login = () => {

    const navigate = useNavigate();
    const { handleSubmit, setUser, setIsAuthenticated } = useContext(AuthContext);
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState('');

    const handleLogin = async (values, { setSubmitting, setFieldError }) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            });

            const result = await response.json();

            if (response.status === 200) {
                // Login successful
                // Use AuthContext's handleSubmit to properly set the authentication state
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                // Update AuthContext state
                setUser(result.user);
                setIsAuthenticated(true);
                showSuccess(result.message || 'Successfully logged in');
                navigate('/');
            } else if (response.status === 401 && result.isVerified === false) {
                // Email not verified
                setUnverifiedEmail(values.email);
                setShowVerificationModal(true);
            } else {
                // Other errors
                showError(result.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            showError(error.message || 'An error occurred during login');
        } finally {
            setSubmitting(false);
        }
    }

    const handleResendVerification = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: unverifiedEmail })
            });

            const result = await response.json();
            
            if (response.status === 200) {
                showSuccess(result.message || 'Verification email has been resent');
                setShowVerificationModal(false);
                // Navigate to OTP verification page with the email in the state
                navigate('/verify-email-otp', { state: { email: unverifiedEmail } });
            } else {
                showError(result.message || 'Failed to resend verification email');
            }
        } catch (error) {
            showError('Failed to resend verification email');
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 ">
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                    <div className="p-8 sm:p-10">
                        {/* Logo and Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                            <p className="text-gray-400">Sign in to your account</p>
                        </div>

                        <Formik
                            initialValues={{ email: '', password: '' }}
                            validate={async (values) => {
                                return await validateForm(loginSchema, values);
                            }}
                            onSubmit={handleLogin}
                        >
                            {({ errors, touched, isSubmitting, values }) => (
                                <Form className="space-y-6">
                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                                        <div className="relative">
                                            <Field 
                                                type="email" 
                                                name="email" 
                                                id="email"
                                                className={`w-full h-12 px-4 pr-12 rounded-xl bg-white/5 border-2 ${errors.email && touched.email ? 'border-red-400/50' : 'border-white/10 hover:border-indigo-400/50 focus:border-indigo-500'} text-white placeholder-gray-400 outline-none transition-all duration-300`} 
                                                placeholder="your@email.com"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        {errors.email && touched.email && (
                                            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                                            <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <Field 
                                                type={showPasswordRequirements ? "text" : "password"}
                                                name="password" 
                                                id="password"
                                                className={`w-full h-12 px-4 pr-12 rounded-xl bg-white/5 border-2 ${errors.password && touched.password ? 'border-red-400/50' : 'border-white/10 hover:border-indigo-400/50 focus:border-indigo-500'} text-white placeholder-gray-400 outline-none transition-all duration-300`} 
                                                placeholder="••••••••"
                                                onFocus={() => setShowPasswordRequirements(true)}
                                                onBlur={() => setShowPasswordRequirements(false)}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                                            >
                                                {showPasswordRequirements ? (
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        {showPasswordRequirements && <PasswordStrength password={values.password} />}
                                        {errors.password && touched.password && !showPasswordRequirements && (
                                            <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                            {isSubmitting ? (
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </span>
                                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                                    </button>

                                    {/* Register Link */}
                                    <div className="text-center mt-6">
                                        <p className="inline-flex items-center text-sm text-gray-400">
                                            Don't have an account?{' '}
                                            <Link 
                                                to="/register" 
                                                className="ml-1.5 flex items-center text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-200 group"
                                            >
                                                Sign up
                                                <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </Link>
                                        </p>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>

            {/* Verification Modal */}
            {showVerificationModal && (
                <Modal isOpen={showVerificationModal} onClose={() => setShowVerificationModal(false)}>
                    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Email Verification Required</h3>
                        <p className="text-gray-700 mb-6">Your email address {unverifiedEmail} has not been verified. Please check your inbox for the verification email and click the link to verify your account.</p>
                        <div className="flex justify-end space-x-4">
                            <button 
                                onClick={handleResendVerification}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Resend Verification Email
                            </button>
                            <button 
                                onClick={() => setShowVerificationModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Login;