import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../../../AuthContext/AuthContext";
import { showSuccess, showError, showInfo } from '../../../utils/toast';

const VerifyEmail = () => {
    const { token } = useParams();
    const { handleSubmit, setUser, setIsAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Auto-submit the form when component mounts
        if (token) {
            handleVerifyEmail({ preventDefault: () => {} });
        } else {
            // If no token, show error and redirect to login
            showError("The verification link is invalid or has expired.");
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
    // We only want to run this effect when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        
        try {
            const result = await handleSubmit(`/verify-email/${token}`, {});
            
            if (result && result.status === 200) {
                // Store user data in localStorage and update AuthContext
                if (result.user) {
                    localStorage.setItem('user', JSON.stringify(result.user));
                    setUser(result.user);
                    setIsAuthenticated(true);
                }
                
                showSuccess(result.message || "Your email has been verified successfully! Please login with your credentials.");
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                // Handle case where response doesn't have expected format
                const errorMessage = result?.message || "Verification failed. Please try again.";
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Email verification error:', error);
            const errorMessage = error.response?.data?.message || 
                               error.message || 
                               "An error occurred while verifying your email. Please try again later.";
            showError(errorMessage);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
    };

    return (
        <div className='w-full flex items-center justify-center p-10'>
            <div className="lg:container mx-auto">
                <div className="flex items-center gap-16 justify-between w-full">


                    {/* right wrapper  */}
                    <div className="right_wrapper space-y-4 max-w-[640px] w-full h-auto">
                        <h3 className='text-5xl text-[#313131] font-semibold capitalize'>verify email</h3>
                        <p className='text-base text-[#313131] font-medium'>An authentication link has been sent to your email</p>

                        <form className='space-y-4' onSubmit={handleVerifyEmail}>

                            <button className='max-w-[640px] w-full h-[56px] bg-[#515def] rounded-lg flex items-center justify-center text-base text-[#f3f3f3] capitalize font-semibold cursor-pointer'>verify email</button>
                        </form>
                    </div>

                    {/* right wrapper  */}
                    <div className="left_wrapper">
                        <img src="/login_&_verify.png" alt="verify email" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;