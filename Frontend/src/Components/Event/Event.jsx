import { motion } from 'framer-motion';
import { useContext, useState } from 'react';
import { FaEdit, FaHeart, FaRegCalendarAlt, FaRegHeart, FaTrash, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../AuthContext/AuthContext';
import { showError, showSuccess } from '../../utils/toast';

const Event = ({ 
  id,
  title,
  date,
  description,
  imageUrl,
  attendees = 0,
  isLiked: initialIsLiked = false,
  category,
  status,
  creator,
  onRegister,
  onLike,
  onEdit,
  isRegistered = false
}) => {
  const { user } = useContext(AuthContext);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleLike = (e) => {
    e.stopPropagation();
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    if (onLike) onLike(id, newLikedState);
  };

  const handleRegister = (e) => {
    e.stopPropagation();
    // Check if user is logged in before allowing registration
    if (!user) {
      // Show login message if user is not logged in
      alert('Please login first to register for this event');
      navigate('/login');
      return;
    }
    if (onRegister) onRegister(id);
  };

  // Format date to a more readable format
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleEventClick = () => {
    navigate(`/events/${id}`);
  };

  return (
    <motion.div 
      className="relative border border-gray-200 rounded-lg overflow-hidden bg-transparent transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] hover:-translate-y-1 cursor-pointer"
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleEventClick}
    >
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden bg-gray-800">
        <img 
          src={imageUrl || 'https://via.placeholder.com/400x200?text=Event+Poster'} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        />
        {/* Event Date & Category */}
        <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
          <FaRegCalendarAlt className="mr-1" />
          <span>{formattedDate}</span>
        </div>
        {category && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-1 rounded">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </div>
        )}
        
        {status && (
          <div className={`absolute bottom-3 right-3 text-xs px-2 py-1 rounded ${status === 'approved' ? 'bg-green-600' : status === 'rejected' ? 'bg-red-600' : 'bg-yellow-600'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        )}
        
        {/* Edit Button - Only show for event creators when event is approved */}
        {user && creator && user._id === (typeof creator === 'object' ? creator._id : creator) && status === 'approved' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) onEdit(id);
            }}
            className="absolute bottom-3 left-3 p-2 bg-black/50 rounded-full text-white hover:bg-blue-500 transition-colors"
            aria-label="Edit event"
          >
            <FaEdit />
          </button>
        )}

        {/* Request Deletion - Only for event creators */}
        {user && creator && user._id === (typeof creator === 'object' ? creator._id : creator) && (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const reason = window.prompt('Please provide a reason for deletion (optional):');
                const token = localStorage.getItem('token');
                if (!token) {
                  showError('You must be logged in to request deletion');
                  return;
                }
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${id}/request-deletion`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ reason: reason || '' })
                });
                const data = await response.json();
                if (response.ok) {
                  showSuccess(data.message || 'Deletion request submitted. Awaiting admin approval.');
                } else {
                  showError(data.message || 'Failed to submit deletion request');
                }
              } catch (error) {
                showError('An error occurred while requesting deletion');
              }
            }}
            className="absolute bottom-3 left-14 p-2 bg-black/50 rounded-full text-white hover:bg-red-600 transition-colors"
            aria-label="Request deletion"
            title="Request deletion"
          >
            <FaTrash />
          </button>
        )}
        
        {/* Like Button */}
        <button 
          onClick={handleLike}
          className="absolute top-3 left-3 p-2 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors"
          aria-label={isLiked ? 'Unlike event' : 'Like event'}
        >
          {isLiked ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart />
          )}
        </button>
      </div>

      {/* Event Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{title}</h3>
        
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center justify-between mt-4">
          {/* Attendees */}
          <div className="flex items-center text-gray-400 text-sm">
            <FaUsers className="mr-1" />
            <span>{attendees} attending</span>
          </div>
          
          {/* Register Button */}
          
          {isRegistered ? (
            <button 
              disabled
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
            >
              Event Registered
            </button>
          ) : (
            <button 
              onClick={handleRegister}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Register Now
            </button>
          )}
          
          {/* Edit Button (Mobile View) - Only show for event creators when event is approved */}
          {user && creator && user._id === creator && status === 'approved' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit(id);
              }}
              className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors md:hidden"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Event;
