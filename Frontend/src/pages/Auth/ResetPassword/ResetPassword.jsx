import { useContext, useRef } from "react";
import { useParams } from 'react-router';
import { useNavigate } from 'react-router';
import AuthContext from "../../../AuthContext/AuthContext";
import { showSuccess, showError } from '../../../utils/toast';


const ResetPassword = () => {

    const createPasswordRef = useRef('');
    const confirmPasswordRef = useRef('');
    const navigate = useNavigate();
    const {token} = useParams();
    const {handleSubmit} = useContext(AuthContext)

    // console.log('reset password token: ', token)

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (createPasswordRef.current.value === confirmPasswordRef.current.value) {

            const body = {
                password: confirmPasswordRef.current.value,
            };

            console.log('confirm password:', confirmPasswordRef.current.value)

            const { status, message } = await handleSubmit(`/reset-password/${token}`, body);


            if (status === 200) {
                showSuccess(message || 'Password has been reset successfully');
                // Clear the password fields
                createPasswordRef.current.value = '';
                confirmPasswordRef.current.value = '';
                
                // Navigate to home after a short delay
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                showError(message || 'Failed to reset password. Please try again.');
            }

        } else {
            console.log('something wrong?')
        }

    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h3 className='text-3xl font-bold text-gray-800 mb-2'>Reset Your Password</h3>
                        <p className='text-gray-600'>Create a new password for your account</p>
                    </div>

                    <form className='space-y-6' onSubmit={handleResetPassword}>
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                <input 
                                    type="password" 
                                    ref={createPasswordRef} 
                                    className='relative w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200' 
                                    placeholder='Create new password' 
                                    required 
                                />
                            </div>
                            
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                <input 
                                    type="password" 
                                    ref={confirmPasswordRef} 
                                    className='relative w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200' 
                                    placeholder='Confirm new password' 
                                    required 
                                />
                            </div>
                            
                            <div className="text-xs text-gray-500 mt-1">
                                <p>Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.</p>
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 shadow-md hover:shadow-lg'
                        >
                            Update Password
                        </button>
                        
                        <div className="text-center mt-4">
                            <a href="/login" className="text-sm text-green-600 hover:text-green-700 hover:underline">
                                Back to Login
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;