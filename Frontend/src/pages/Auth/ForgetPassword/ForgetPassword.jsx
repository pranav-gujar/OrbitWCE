import { useContext, useRef } from 'react';
import { useNavigate } from 'react-router';
import AuthContext from '../../../AuthContext/AuthContext';
import { showError, showSuccess } from '../../../utils/toast';

const ForgetPassword = () => {

    const findEmailRef = useRef('');
    const {handleSubmit} = useContext(AuthContext);
    const navigate = useNavigate();


    const handleForget = async (e) => {
            e.preventDefault();
    
            const body = {
                email: findEmailRef.current.value,
            }
    
            // Using direct fetch instead of handleSubmit to avoid auth path prefix issues
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/forget-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            
            const data = await response.json();
            const status = response.status;
            const message = data.message;
    
    
            if (status === 200) {
                showSuccess(message || 'Password reset OTP has been sent to your email');
                findEmailRef.current.value = ''; // Clear the email field
                
                // Navigate to OTP verification page with email in state
                navigate('/reset-password-otp', { state: { email: body.email } });
            } else {
                showError(message || 'Failed to process your request. Please try again.');
            }
        }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 ">
            <div className="w-full max-w-md">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
                    <div className="text-center mb-8">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className='text-3xl font-bold text-gray-800 mb-2'>Forgot Password?</h3>
                            <p className='text-gray-600'>Enter your email and we'll send you an OTP code</p>
                        </div>

                    <form className='space-y-6' onSubmit={handleForget}>
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                            <input 
                                type="email" 
                                ref={findEmailRef} 
                                className='relative w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200' 
                                placeholder='Enter your email' 
                                required 
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className='w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 shadow-md hover:shadow-lg'
                        >
                            Send OTP Code
                        </button>
                        
                        <div className="text-center mt-4">
                            <a href="/login" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                                Back to Login
                            </a>
                        </div>
                    </form>
                </div>
                
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Remember your password? <a href="/login" className="text-blue-600 hover:underline">Sign in</a></p>
                </div>
            </div>
        </div>
    );
};

export default ForgetPassword;