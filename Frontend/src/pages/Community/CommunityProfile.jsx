import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaEnvelope,
  FaGlobe,
  FaQuoteLeft,
  FaUserFriends,
  FaCalendarAlt,
  FaImage,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaArrowLeft,
  FaTrash,
  FaUpload
} from 'react-icons/fa';
import AuthContext from '../../AuthContext/AuthContext';
import { showError, showSuccess } from '../../utils/toast';

const CommunityProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const handleImageError = (e) => {
    console.error('Image failed to load:', {
      originalSrc: communityUser?.photo,
      currentSrc: e.target.src,
      timestamp: new Date().toISOString()
    });
    
    // If we're here, both the main and fallback images failed to load
    const container = e.target.parentNode;
    if (container) {
      const initial = communityUser?.name?.charAt(0)?.toUpperCase() || 'C';
      container.innerHTML = `
        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl font-bold">
          ${initial}
        </div>
      `;
    }
  };
  
  const [communityUser, setCommunityUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('about');
  const [isUploading, setIsUploading] = useState(false);
  
  // Initialize team members array to prevent undefined errors
  const teamMembers = communityUser?.teamMembers || [];

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    fetchCommunityUser();
    fetchCommunityEvents();
  }, [id]);

  const fetchCommunityUser = async () => {
    try {
      setLoading(true);
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Prepare headers with token if available
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/community/${id}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch community profile');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCommunityUser(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch community profile');
      }
    } catch (error) {
      console.error('Error fetching community profile:', error);
      showError(error.message || 'Failed to fetch community profile');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityEvents = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Prepare headers with token if available
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events?creator=${id}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch community events');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch community events');
      }
    } catch (error) {
      console.error('Error fetching community events:', error);
      // Don't show error for events, just keep the array empty
      setEvents([]);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      showError('Please upload an image file');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showError('File size should not exceed 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update the community user data with the new photo URL
        const updatedUser = { ...communityUser, photo: data.url };
        setCommunityUser(updatedUser);
        showSuccess('Profile photo updated successfully');
      } else {
        throw new Error(data.message || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showError(error.message || 'Error uploading photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    const updatedUser = { ...communityUser, photo: '' };
    setCommunityUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community profile...</p>
        </div>
      </div>
    );
  }

  if (!communityUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full mx-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Community not found
          </h2>
          <p className="text-gray-600 mb-6">
            The community profile you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl overflow-hidden mb-8">
          <div className="p-6 sm:p-10">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              {/* Profile Image */}
              <div className="relative group mb-4 md:mb-0 md:mr-8">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                  {communityUser?.photo ? (
                    <img 
                      src={
                        communityUser.photo.startsWith('http') || 
                        communityUser.photo.startsWith('blob:') ? 
                          communityUser.photo : 
                          `${import.meta.env.VITE_API_URL}/uploads/${communityUser.photo.replace(/^[\/\\]?uploads[\/\\]?/, '')}`
                      } 
                      alt={communityUser.name || 'Profile'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', e.target.src);
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-4xl">{communityUser.name?.charAt(0).toUpperCase() || 'C'}</span>
                    </div>
                  )}
                </div>
                
                {/* Upload/Remove Overlay - Only show for the profile owner */}
                {user?._id === communityUser._id && (
                  <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex flex-col items-center space-y-2">
                      <label className="cursor-pointer p-2 text-white hover:text-blue-300">
                        <FaUpload className="text-xl" />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                      </label>
                      {communityUser.photo && (
                        <button 
                          onClick={handleRemovePhoto}
                          className="p-2 text-white hover:text-red-400"
                          disabled={isUploading}
                        >
                          <FaTrash className="text-xl" />
                        </button>
                      )}
                    </div>
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{communityUser.name}</h1>
                <p className="text-gray-300 text-lg mb-4">{communityUser.role}</p>
                
                {communityUser.motto && (
                  <div className="flex items-center justify-center md:justify-start mb-4">
                    <FaQuoteLeft className="text-gray-400 mr-2" />
                    <p className="text-gray-300 italic">{communityUser.motto}</p>
                  </div>
                )}

                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                  {communityUser.email && (
                    <div className="flex items-center text-gray-300">
                      <FaEnvelope className="mr-2 text-gray-400" />
                      <span>{communityUser.email}</span>
                    </div>
                  )}
                  
                  {communityUser.website && (
                    <div className="flex items-center text-gray-300">
                      <FaGlobe className="mr-2 text-gray-400" />
                      <a 
                        href={communityUser.website.startsWith('http') ? communityUser.website : `https://${communityUser.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors"
                      >
                        {communityUser.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex justify-center md:justify-start space-x-4">
                  {communityUser.linkedin && (
                    <a 
                      href={communityUser.linkedin.startsWith('http') ? communityUser.linkedin : `https://${communityUser.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <FaLinkedin size={24} />
                    </a>
                  )}
                  
                  {communityUser.github && (
                    <a 
                      href={communityUser.github.startsWith('http') ? communityUser.github : `https://github.com/${communityUser.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <FaGithub size={24} />
                    </a>
                  )}
                  
                  {communityUser.twitter && (
                    <a 
                      href={communityUser.twitter.startsWith('http') ? communityUser.twitter : `https://twitter.com/${communityUser.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <FaTwitter size={24} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-gray-700">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'about' ? 'text-white border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'team' ? 'text-white border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
            >
              Team Members
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'events' ? 'text-white border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
            >
              Events
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {/* About Tab */}
          {activeTab === 'about' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4">About</h2>
              <div className="prose prose-lg prose-invert max-w-none">
                <p className="text-gray-300">
                  {communityUser.bio || `${communityUser.name} is a community member of PGT Global Networks.`}
                </p>
              </div>
            </motion.div>
          )}

          {/* Team Members Tab */}
          {activeTab === 'team' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Team Members</h2>
                <span className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
                  {teamMembers.length} {teamMembers.length === 1 ? 'Member' : 'Members'}
                </span>
              </div>
              
              {teamMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teamMembers.map((member, index) => (
                    <div 
                      key={member._id || index} 
                      className="border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 text-gray-100"
                    >
                      <div className="flex items-start space-x-4">
                        {/* Member Photo */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200/20 border-2 border-white/10 flex items-center justify-center">
                            {member.photo ? (
                              <img 
                                src={member.photo.startsWith('http') ? member.photo : `${import.meta.env.VITE_API_URL}/uploads/${member.photo.replace(/^[\/\\]?uploads[\/\\]?/, '')}`} 
                                alt={member.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  const fallback = e.target.parentNode.querySelector('.member-initial');
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : (
                              <FaUser className="text-gray-400 text-2xl" />
                            )}
                            <div className="member-initial w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold items-center justify-center hidden">
                              {member.name?.charAt(0).toUpperCase() || 'M'}
                            </div>
                          </div>
                        </div>

                        {/* Member Info */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-100">{member.name}</h3>
                              <p className="text-sm text-indigo-300">{member.role}</p>
                            </div>
                          </div>
                          
                          {member.bio && (
                            <p className="text-sm text-gray-300 mt-2">{member.bio}</p>
                          )}

                          {/* Social Links */}
                          {(member.socialLinks?.linkedin || 
                            member.socialLinks?.github || 
                            member.socialLinks?.twitter || 
                            member.socialLinks?.website) && (
                            <div className="flex space-x-3 mt-3 pt-3 border-t border-white/10">
                              {member.socialLinks?.linkedin && (
                                <a 
                                  href={`${member.socialLinks.linkedin}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="LinkedIn"
                                >
                                  <FaLinkedin size={16} />
                                </a>
                              )}
                              {member.socialLinks?.github && (
                                <a 
                                  href={`${member.socialLinks.github}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-300 hover:text-white transition-colors"
                                  title="GitHub"
                                >
                                  <FaGithub size={16} />
                                </a>
                              )}
                              {member.socialLinks?.twitter && (
                                <a 
                                  href={`${member.socialLinks.twitter}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="Twitter"
                                >
                                  <FaTwitter size={16} />
                                </a>
                              )}
                              {member.socialLinks?.website && (
                                <a 
                                  href={member.socialLinks.website.startsWith('http') ? 
                                        member.socialLinks.website : 
                                        `${member.socialLinks.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-300 hover:text-purple-200 transition-colors"
                                  title="Website"
                                >
                                  <FaGlobe size={16} />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No team members have been added yet.</p>
              )}
            </motion.div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Events Created by {communityUser.name}</h2>
              
              {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div 
                      key={event._id} 
                      className="bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/events/${event._id}`)}
                    >
                      <div className="h-40 bg-gray-600 relative">
                        {event.imageUrl ? (
                          <>
                            <img 
                              src={event.imageUrl} 
                              alt={event.title} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Don't hide the image element, just show the fallback icon
                                e.target.style.display = 'none';
                                // Make sure the fallback div is visible
                                const fallbackDiv = e.target.parentNode.querySelector('.fallback-image');
                                if (fallbackDiv) {
                                  fallbackDiv.style.display = 'flex';
                                }
                              }}
                            />
                            <div className="fallback-image w-full h-full flex items-center justify-center" style={{display: 'none'}}>
                              <FaImage className="text-gray-500" size={40} />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaImage className="text-gray-500" size={40} />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <h3 className="text-white font-medium truncate">{event.title}</h3>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center text-gray-300 text-sm mb-2">
                          <FaCalendarAlt className="mr-2" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No events have been created by {communityUser.name} yet.</p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityProfile;