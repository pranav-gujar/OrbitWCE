import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FaBell, FaCheck, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import { showSuccess, showError } from '../../utils/toast';
import AuthContext from '../../AuthContext/AuthContext';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setNotifications(data.data);
      } else {
        showError(data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showError('An error occurred while fetching notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setNotifications(notifications.map(notification => 
          notification._id === id ? { ...notification, isRead: true } : notification
        ));
        showSuccess('Notification marked as read');
      } else {
        showError(data.message || 'Failed to update notification');
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      showError('An error occurred while updating notification');
    }
  };

  const deleteNotification = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setNotifications(notifications.filter(notification => notification._id !== id));
        showSuccess('Notification deleted');
      } else {
        showError(data.message || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      showError('An error occurred while deleting notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event_approved':
        return <FaCheck className="text-green-500" />;
      case 'event_rejected':
        return <FaTimes className="text-red-500" />;
      case 'event_deleted':
        return <FaTimes className="text-red-500" />;
      case 'new_event':
        return <FaCalendarAlt className="text-blue-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div 
            className="inline-flex items-center justify-center p-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-xl mb-6"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }}
          >
            <FaBell className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold !text-gray-200 mb-3">
            Your Notifications
          </h1>
          <p className="text-lg text-gray-300 max-w-md mx-auto">
            Stay updated with all your community activities and events 
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <motion.div 
              className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-600 font-medium">Loading your notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 transform transition-all hover:shadow-md"
          >
            <motion.div 
              className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-indigo-50 mb-6"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
            >
              <FaBell className="h-12 w-12 text-indigo-300" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-800">No notifications yet</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              You're all caught up! New notifications will appear here.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              onClick={fetchNotifications}
            >
              Refresh
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {notifications.map((notification) => (
              <motion.div
                key={notification._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { type: 'spring', stiffness: 300, damping: 24 }
                  }
                }}
                whileHover={{ x: 5 }}
                className={`relative bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  !notification.isRead ? 'border-l-4 border-indigo-500' : 'border-l-4 border-transparent'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <motion.div 
                        className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 shadow-inner"
                        whileHover={{ rotate: 10, scale: 1.1 }}
                      >
                        {getNotificationIcon(notification.type)}
                      </motion.div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-base font-medium ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {notification.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="ml-3 text-sm text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-1">
                      {!notification.isRead && (
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => markAsRead(notification._id)}
                          className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 transition-all"
                          title="Mark as read"
                        >
                          <FaCheck className="h-4 w-4" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => deleteNotification(notification._id)}
                        className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-all"
                        title="Delete notification"
                      >
                        <FaTimes className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Notifications;