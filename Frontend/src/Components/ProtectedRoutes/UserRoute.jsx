import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';

const UserRoute = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');
        
        if (!token || !userString) {
          return { authorized: false, isSuperAdmin: false };
        }
        
        const user = JSON.parse(userString);
        const isSuperAdmin = user.role === 'superadmin';
        
        return { 
          authorized: !isSuperAdmin, 
          isSuperAdmin 
        };
      } catch (error) {
        console.error('UserRoute - Error:', error);
        return { authorized: false, isSuperAdmin: false };
      } finally {
        setIsLoading(false);
      }
    };
    
    const { authorized, isSuperAdmin } = checkAuth();
    
    if (isSuperAdmin) {
      toast.info('Redirecting to SuperAdmin Dashboard');
    } else if (!authorized) {
      toast.error('Please log in to continue');
    }
    
    setIsAuthorized(authorized);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    // Allow Super Admin to access the profile page
    if (user?.role === 'superadmin' && !window.location.pathname.startsWith('/profile')) {
      return <Navigate to="/superadmin" replace />;
    }
    
    // If not a Super Admin and not authorized, redirect to login
    if (user?.role !== 'superadmin') {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default UserRoute;
