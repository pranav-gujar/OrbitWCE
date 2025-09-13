import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';

const SuperAdminRoute = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');
        
        console.log('SuperAdminRoute - Token:', token ? 'exists' : 'missing');
        console.log('SuperAdminRoute - User data:', userString);
        
        if (!token || !userString) {
          console.log('No token or user data, redirecting to login');
          return false;
        }
        
        const user = JSON.parse(userString);
        console.log('SuperAdminRoute - User role:', user.role);
        
        return user.role === 'superadmin';
      } catch (error) {
        console.error('SuperAdminRoute - Error:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    };
    
    const isAuth = checkAuth();
    setIsAuthorized(isAuth);
    
    if (!isAuth && !isLoading) {
      toast.error('Access denied. SuperAdmin privileges required.');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthorized ? <Outlet /> : <Navigate to="/" replace />;
};

export default SuperAdminRoute;
