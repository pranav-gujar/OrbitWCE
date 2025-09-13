import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaUserShield, FaSearch, FaSpinner, FaLock } from 'react-icons/fa';
import './SuperApp.css';

// Helper function to safely access nested properties
const safeGet = (obj, path, defaultValue = 'N/A') => {
  try {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue), obj);
  } catch (error) {
    return defaultValue;
  }
};

const SuperApp = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check if user is authorized (superadmin)
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');
        
        console.log('Auth check - Token:', token ? 'exists' : 'missing');
        console.log('Auth check - User data:', userString);
        
        // If no token or user data, redirect to login
        if (!token || !userString) {
          console.log('No token or user data, redirecting to login');
          toast.error('Please log in to continue');
          navigate('/login');
          return;
        }
        
        const user = JSON.parse(userString);
        console.log('User role:', user.role);
        
        // Check if user is superadmin
        if (user.role === 'superadmin') {
          console.log('User is superadmin, granting access');
          setIsAuthorized(true);
        } else {
          console.log('User is not a superadmin, access denied');
          toast.error('Access denied. SuperAdmin privileges required.');
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        toast.error('An error occurred while checking your permissions');
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Fetch all users with token validation
  useEffect(() => {
    if (!isAuthorized) {
      console.log('Not authorized, skipping user fetch');
      return;
    }
    
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log('Fetching users with token:', token ? 'Token exists' : 'No token found');
        
        // Check if token exists
        if (!token) {
          console.error('No authentication token found');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        // Check if token is expired
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const isTokenExpired = tokenPayload.exp * 1000 < Date.now();
          
          if (isTokenExpired) {
            console.error('Token has expired');
            localStorage.removeItem('token');
            toast.error('Your session has expired. Please log in again.');
            navigate('/login');
            return;
          }
        } catch (parseError) {
          console.error('Error parsing token:', parseError);
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        
        // Using the secure RBAC-protected endpoint with environment variable
        const API_URL = `${import.meta.env.VITE_API_URL}/api/users`;
        console.log('Making request to:', API_URL);
        
        // Set the token in both Authorization header and cookies for compatibility
        document.cookie = `token=${token}; path=/; samesite=lax; secure`;
        
        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include' // This is required to send cookies
        });

        console.log('Response status:', response.status);
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
          localStorage.removeItem('token');
          toast.error('Your session has expired. Please log in again.');
          navigate('/login');
          return;
        }
        
        // Handle other error statuses
        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            console.error('Error response data:', errorData);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error('Could not parse error response:', e);
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('API Response:', result);
        
        if (result && result.success) {
          setUsers(result.data || []);
          setFilteredUsers(result.data || []);
        } else {
          throw new Error(result?.message || 'Invalid response format');
        }
      } catch (error) {
        console.error('Error in fetchUsers:', error);
        
        // Handle specific error cases
        if (error.message.includes('401') || 
            error.message.includes('token') || 
            error.message.includes('expired')) {
          toast.error('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          toast.error(error.message || 'Failed to load users');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentUser, navigate, isAuthorized]);

  // Filter users based on search term
  useEffect(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    
    const filtered = (users || []).filter(user => {
      if (!user) return false;
      
      // Use safeGet to safely access user properties
      const name = safeGet(user, 'name', '').toLowerCase();
      const email = safeGet(user, 'email', '').toLowerCase();
      const role = safeGet(user, 'role', '').toLowerCase();
      
      return (
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        role.includes(searchLower)
      );
    });
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Role change functionality has been removed as per requirements

  const getRoleBadge = (role) => {
    const roleStyles = {
      user: 'bg-blue-100 text-blue-800',
      admin: 'bg-purple-100 text-purple-800',
      superadmin: 'bg-yellow-100 text-yellow-800',
    };

    const defaultStyle = 'bg-gray-100 text-gray-800';
    const style = roleStyles[role] || defaultStyle;
    const displayRole = role || 'user';

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>
        {displayRole}
      </span>
    );
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <FaLock className="text-5xl text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this page. Only Super Admins are allowed.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-md transition duration-200"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
     

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Search and Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="relative w-full md:w-96 mb-4 md:mb-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white p-4 rounded-lg shadow flex-1 min-w-[200px]">
                <p className="text-sm font-medium text-gray-500">Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.role === 'user').length}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow flex-1 min-w-[200px]">
                <p className="text-sm font-medium text-gray-500">Community</p>
                <p className="text-2xl font-semibold text-green-600">
                  {users.filter(u => u.role === 'community').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    // Skip rendering if user is invalid
                    if (!user || !user._id) return null;
                    
                    // Safely get user properties
                    const userId = safeGet(user, '_id', '');
                    const userName = safeGet(user, 'name', 'N/A');
                    const userEmail = safeGet(user, 'email', 'N/A');
                    const userRole = safeGet(user, 'role', 'user');
                    const isVerified = safeGet(user, 'isVerified', false);
                    
                    return (
                      <tr key={userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FaUser className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {userName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {userId ? `${userId.substring(0, 8)}...` : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaEnvelope className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{userEmail}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(userRole)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => userId && navigate(`/profile/${userId}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperApp;
