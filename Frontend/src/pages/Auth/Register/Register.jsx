import { Field, Form, Formik } from 'formik';
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import AuthContext from '../../../AuthContext/AuthContext';
import PasswordStrength from '../../../Components/PasswordStrength/PasswordStrength';
import { showError, showSuccess } from '../../../utils/toast';
import { registerSchema, validateForm } from '../../../utils/validationSchemas';

const Register = () => {

    const { handleSubmit } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

    const handleRegister = async (values, { setSubmitting, resetForm }) => {
        try {
            console.log('Form values being submitted:', values);
            const dataToSend = {
                name: values.name,
                email: values.email,
                password: values.password,
                role: values.role || 'user', // Default to 'user' if not selected
            };
            console.log('Data being sent to backend:', dataToSend);
            
            // Using direct fetch instead of handleSubmit to avoid auth path prefix issues
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });
            
            const data = await response.json();
            const status = response.status;
            const message = data.message;

            if (status === 201) {
                showSuccess(message || 'Registration successful! Please check your email for OTP verification.');
                resetForm();
                
                // Navigate to OTP verification page with email in state
                navigate('/verify-email-otp', { state: { email: dataToSend.email } });
            } else {
                showError(message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            showError(error.message || 'An error occurred during registration');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 ">
            <div className="w-full max-w-4xl mx-auto">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                    <div className="p-8 sm:p-10 md:p-12">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 mb-6 shadow-lg transform transition-transform duration-500 hover:scale-110">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <h3 className='text-4xl md:text-5xl font-bold text-white mb-3 bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400'>Create Account</h3>
                            <p className='text-gray-300 text-sm sm:text-base'>Join our community and start your journey with us</p>
                            
                            <div className="mt-6 relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-gray-900 text-gray-300">Fill in your details</span>
                                </div>
                            </div>
                        </div>

                        <Formik
                            initialValues={{ 
                                name: '', 
                                email: '', 
                                password: '', 
                                confirmPassword: '',
                                role: 'user' // Default role
                            }}
                            validate={async (values) => {
                                return await validateForm(registerSchema, values);
                            }}
                            onSubmit={handleRegister}
                        >
                            {({ errors, touched, isSubmitting, setFieldError, values }) => (
                                <Form className='space-y-4 text-gray-300'>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Name Field */}
                                        <div className="space-y-1 transition-all duration-300 transform hover:scale-[1.01]">
                                            <div className="relative">
                                                <Field 
                                                    type="text" 
                                                    name="name" 
                                                    className={`w-full h-14 px-4 pr-12 rounded-xl bg-white/5 border-2 ${errors.name && touched.name ? 'border-red-400/50' : 'border-white/10 hover:border-indigo-400/50 focus:border-indigo-500'} text-white placeholder-gray-400 outline-none transition-all duration-300`} 
                                                    placeholder="Your full name"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            {errors.name && touched.name && (
                                                <div className="text-red-400 text-sm ml-1 flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {errors.name}
                                                </div>
                                            )}
                                        </div>

                                        {/* Email Field */}
                                        <div className="space-y-1 transition-all duration-300 transform hover:scale-[1.01]">
                                            <div className="relative">
                                                <Field 
                                                    type="email" 
                                                    name="email" 
                                                    className={`w-full h-14 px-4 pr-12 rounded-xl bg-white/5 border-2 ${errors.email && touched.email ? 'border-red-400/50' : 'border-white/10 hover:border-indigo-400/50 focus:border-indigo-500'} text-white placeholder-gray-400 outline-none transition-all duration-300`} 
                                                    placeholder="Your email address"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            {errors.email && touched.email && (
                                                <div className="text-red-400 text-sm ml-1 flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {errors.email}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Password Field */}
                                        <div className="space-y-1 transition-all duration-300 transform hover:scale-[1.01]">
                                            <div className="relative">
                                                <Field 
                                                    type={showPasswordRequirements ? 'text' : 'password'} 
                                                    name="password" 
                                                    className={`w-full h-14 px-4 pr-12 rounded-xl bg-white/5 border-2 ${errors.password && touched.password ? 'border-red-400/50' : 'border-white/10 hover:border-indigo-400/50 focus:border-indigo-500'} text-white placeholder-gray-400 outline-none transition-all duration-300`} 
                                                    placeholder="Create a password"
                                                    onFocus={() => setShowPasswordRequirements(true)}
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
                                                        className="text-gray-400 hover:text-white focus:outline-none"
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
                                            </div>
                                            {showPasswordRequirements && <PasswordStrength password={values.password} />}
                                            {errors.password && touched.password && (
                                                <div className="text-red-400 text-sm ml-1 flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {errors.password}
                                                </div>
                                            )}
                                        </div>

                                        {/* Confirm Password Field */}
                                        <div className="space-y-1 transition-all duration-300 transform hover:scale-[1.01]">
                                            <div className="relative">
                                                <Field 
                                                    type="password" 
                                                    name="confirmPassword" 
                                                    className={`w-full h-14 px-4 pr-12 rounded-xl bg-white/5 border-2 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-400/50' : 'border-white/10 hover:border-indigo-400/50 focus:border-indigo-500'} text-white placeholder-gray-400 outline-none transition-all duration-300`} 
                                                    placeholder="Confirm your password"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            {errors.confirmPassword && touched.confirmPassword && (
                                                <div className="text-red-400 text-sm ml-1 flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {errors.confirmPassword}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Role Field - Full width */}
                                    <div className="space-y-1 transition-all duration-300 transform hover:scale-[1.01]">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <Field 
                                                as="select" 
                                                name="role" 
                                                className='w-full h-14 pl-10 pr-12 rounded-xl bg-white/5 border-2 border-white/10 hover:border-indigo-400/50 focus:border-indigo-500 text-white outline-none appearance-none transition-all duration-300'
                                            >
                                                <option value="user" className="bg-gray-800 text-white">Regular User</option>
                                            </Field>
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        {errors.role && touched.role && (
                                            <div className="text-red-400 text-sm ml-1 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {errors.role}
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        type='submit' 
                                        disabled={isSubmitting}
                                        className={`w-full h-14 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-300 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-indigo-500/30'}`}
                                    >
                                        <span className="flex items-center justify-center">
                                            {isSubmitting ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Creating Account...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="mr-2">Create Account</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                    </svg>
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </Form>
                            )}
                        </Formik>

                        <div className="text-center mt-6">
                            <p className="inline-flex items-center text-sm text-gray-400 font-normal">
                                Already have an account?{' '}
                                <Link 
                                    to="/login" 
                                    className="ml-1.5 flex items-center text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-200 group"
                                >
                                    Login
                                    <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;