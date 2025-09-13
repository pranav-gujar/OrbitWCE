import { createContext, useContext, useEffect, useState } from "react";
import { showError } from "../utils/toast";

// Create the context
export const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on initial load
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        const result = await response.json();
                        if (response.ok) {
                            setUser(result.data);
                            setIsAuthenticated(true);
                            localStorage.setItem('user', JSON.stringify(result.data));
                        } else {
                            // fallback to stored user if available
                            const userData = JSON.parse(localStorage.getItem('user') || '{}');
                            if (userData && Object.keys(userData).length) {
                                setUser(userData);
                                setIsAuthenticated(true);
                            } else {
                                localStorage.removeItem('token');
                            }
                        }
                    } catch (err) {
                        console.error('Failed to verify token:', err);
                        localStorage.removeItem('token');
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const handleSubmit = async (url, data) => {
        try {
            const isLogin = url.includes('/login');
            const isRegister = url.includes('/register');
            const isLogout = url.includes('/logout');

            if (isLogout) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                setIsAuthenticated(false);
                return { status: 200, message: 'Logged out successfully' };
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth${url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong');
            }

            if (isLogin || isRegister) {
                // Store token for both login and registration
                localStorage.setItem('token', result.token);
                
                if (isLogin) {
                    // For login, set user data and authentication state
                    // The verification check is now done in the Login component
                    localStorage.setItem('user', JSON.stringify(result.user));
                    setUser(result.user);
                    setIsAuthenticated(true);
                } else if (isRegister) {
                    // For registration, we don't set the user data yet as they need to verify email
                    // We'll just store the token for potential verification needs
                }
            }

            return result;

        } catch (error) {
            console.error('API call failed:', error);
            showError(error.message || 'An error occurred');
            throw error;
        }
    };

    // Function to update user profile
    const updateUserProfile = async (updatedData) => {
        try {
            const token = localStorage.getItem('token');
            const userRole = JSON.parse(localStorage.getItem('user'))?.role || 'user';
            
            // Determine the endpoint based on user role
            const endpoint = userRole === 'community' 
                ? `${import.meta.env.VITE_API_URL}/api/users/profile/update`
                : `${import.meta.env.VITE_API_URL}/api/users/profile/user`;
            
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update profile');
            }

            // Update the user in context and local storage
            const updatedUser = { ...user, ...updatedData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            return { success: true, data: result.data || result };
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            loading,
            handleSubmit,
            setUser,
            setIsAuthenticated,
            updateUserProfile
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context as default and AuthProvider as named export
export default AuthContext;