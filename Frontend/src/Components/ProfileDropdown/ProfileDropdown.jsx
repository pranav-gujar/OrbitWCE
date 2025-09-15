import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaCog, FaUser, FaChartLine } from 'react-icons/fa';

const ProfileDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    await onLogout(e);
    setIsOpen(false);
  };

  // For regular users, show Dashboard link that goes to dashboard
  if (user?.role === 'user') {
    return (
      <div className="relative">
        <Link 
          to="/dashboard"
          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
        >
        <FaChartLine className="mr-1" />
          Dashboard
        </Link>
      </div>
    );
  }

  // For other roles (admin, community), show the profile dropdown
  // Add click outside handler
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen) {
        const dropdown = document.querySelector('.profile-dropdown-container');
        const button = document.querySelector('[aria-expanded="true"]');
        
        if (dropdown && !dropdown.contains(event.target) && 
            button && !button.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  return (
    <div className="relative h-10 flex items-center">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-center w-10 h-10 focus:outline-none relative z-[60]"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden ring-2 ring-white  transition-all duration-200">
          {user?.profilePicture || user?.photo ? (
            <img 
              src={user.profilePicture ? 
                (user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_API_URL}${user.profilePicture}`) : 
                (user.photo && user.photo.startsWith('http') ? user.photo : `${import.meta.env.VITE_API_URL}${user.photo}`)
              } 
              alt={user.name || 'Profile'} 
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image failed to load:', e.target.src);
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : (
            <FaUserCircle className="w-8 h-8 text-white" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="fixed top-16 right-4 w-56 bg-white rounded-lg shadow-xl py-1 z-[1000] border border-gray-100">
          {/* Click outside to close */}
          <div 
            className="fixed inset-0 z-[999]  " 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }} 
          ></div>
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <p className="text-sm font-medium">{user?.name || 'User'}</p>
            <p className="text-xs text-indigo-100 truncate">{user?.email || ''}</p>
          </div>
          
          {user?.role === 'user' && (
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <FaChartLine className="mr-3" />
              Dashboard
            </Link>
          )}
          
          <Link
            to="/profile"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <FaUser className="mr-3" />
            My Profile
          </Link>
          
          {/* <Link
            to="/settings"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <FaCog className="mr-3" />
            Settings
          </Link> */}
          
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
          >
            <FaSignOutAlt className="mr-3" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
