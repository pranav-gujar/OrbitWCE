import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import AuthContext from '../../AuthContext/AuthContext';

const NotificationIndicator = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      // Set up polling to check for new notifications every minute
      const interval = setInterval(fetchUnreadCount, 60000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Count unread notifications
        const unreadNotifications = data.data.filter(notification => !notification.isRead);
        setUnreadCount(unreadNotifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  if (!user) return null;

  return (
    <Link to="/notifications" className="relative">
      <FaBell className="text-xl text-gray-600 hover:text-gray-800" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationIndicator;