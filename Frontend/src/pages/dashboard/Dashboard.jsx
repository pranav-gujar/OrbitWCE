import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../AuthContext/AuthContext';
import socket from '../../socket';
import { FaUser, FaCalendarAlt, FaRegCalendarCheck, FaSignOutAlt, FaHeart, FaEdit } from 'react-icons/fa';

const Dashboard = () => {
  const { user, handleSubmit, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [likedEvents, setLikedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    photo: '',
    phone: '',
    socialLinks: {
      linkedin: '',
      portfolio: ''
    }
  });

  useEffect(() => {
    // If user data is available in context, use it
    if (user) {
      setProfileData({
        name: user.name || '',
        bio: user.bio || '',
        photo: user.photo || '',
        phone: user.phone || '',
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || '',
          portfolio: user.socialLinks?.portfolio || ''
        }
      });
      fetchData();
    } else {
      // If no user in context, try to get from localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (storedUser) {
        console.log('Loading user data from localStorage');
        setUser(storedUser);
        setProfileData({
          name: storedUser.name || '',
          bio: storedUser.bio || '',
          photo: storedUser.photo || '',
          phone: storedUser.phone || '',
          socialLinks: {
            linkedin: storedUser.socialLinks?.linkedin || '',
            portfolio: storedUser.socialLinks?.portfolio || ''
          }
        });
        fetchData();
      }
    }
  }, [user, setUser]);
  
  // Listen for profile updates via socket
  useEffect(() => {
    // Ensure socket is connected
    if (!socket.connected) {
      console.log('Socket not connected, connecting now...');
      socket.connect();
    }
    
    // Setup socket listener for profile updates
    const handleProfileUpdated = (updatedProfile) => {
      console.log('Received profile_updated event in Dashboard:', updatedProfile);
      
      // Only update if this is the current user's profile
      if (user && updatedProfile._id === user._id) {
        console.log('Updating dashboard profile data from socket event');
        
        // Update the local profile data
        setProfileData({
          name: updatedProfile.name || '',
          bio: updatedProfile.bio || '',
          photo: updatedProfile.photo || '',
          phone: updatedProfile.phone || '',
          socialLinks: {
            linkedin: updatedProfile.socialLinks?.linkedin || '',
            portfolio: updatedProfile.socialLinks?.portfolio || ''
          }
        });
        
        // Update user in context
        setUser(prev => ({
          ...prev,
          ...updatedProfile
        }));
        
        // Store updated user in localStorage to persist changes
        localStorage.setItem('user', JSON.stringify(updatedProfile));
      }
    };
    
    // Register socket event listener
    socket.on('profile_updated', handleProfileUpdated);
    
    // Clean up the listener when component unmounts
    return () => {
      socket.off('profile_updated', handleProfileUpdated);
    };
  }, [user, setUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      };
      
      // Fetch upcoming events
      const eventsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
        method: 'GET',
        headers
      });
      
      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const eventsData = await eventsResponse.json();
      setEvents(eventsData.data || []);
      
      // Fetch registered events - improved implementation
      const registeredEvts = [];
      
      // Filter events with registrations that match the user's email
      if (eventsData.data && eventsData.data.length > 0) {
        eventsData.data.forEach(event => {
          // Check main event registrations
          if (event.registrations && Array.isArray(event.registrations)) {
            const userRegistrations = event.registrations.filter(reg => reg.email === user.email);
            
            // Add main event registration if exists
            if (userRegistrations.length > 0) {
              registeredEvts.push({
                id: event._id,
                title: event.title,
                date: new Date(event.date).toLocaleDateString(),
                status: 'Registered',
                type: 'event',
                eventId: event._id
              });
            }
            
            // Check sub-event registrations
            if (event.subEvents && Array.isArray(event.subEvents)) {
              event.subEvents.forEach(subEvent => {
                if (subEvent.registrations && Array.isArray(subEvent.registrations)) {
                  const subEventUserRegistrations = subEvent.registrations.filter(
                    reg => reg.email === user.email
                  );
                  
                  if (subEventUserRegistrations.length > 0) {
                    registeredEvts.push({
                      id: `${event._id}-${subEvent._id}`,
                      title: `${event.title} - ${subEvent.name}`,
                      date: subEvent.date ? new Date(subEvent.date).toLocaleDateString() : 'Date not specified',
                      status: 'Registered',
                      type: 'subevent',
                      eventId: event._id,
                      subEventId: subEvent._id
                    });
                  }
                }
              });
            }
          }
        });
      }
      
      setRegisteredEvents(registeredEvts);
      
      // Fetch liked events from the API
      try {
        const likedEventsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/events/user/liked`, {
          method: 'GET',
          headers
        });
        
        if (likedEventsResponse.ok) {
          const likedEventsData = await likedEventsResponse.json();
          
          if (likedEventsData.data && Array.isArray(likedEventsData.data)) {
            const formattedLikedEvents = likedEventsData.data.map(event => ({
              id: event._id,
              title: event.title,
              date: new Date(event.date).toLocaleDateString(),
              location: event.location || 'Not specified'
            }));
            setLikedEvents(formattedLikedEvents);
          } else {
            console.warn('Liked events data is not in expected format:', likedEventsData);
            setLikedEvents([]);
          }
        } else {
          console.error('Failed to fetch liked events');
          setLikedEvents([]);
        }
      } catch (error) {
        console.error('Error fetching liked events:', error);
        setLikedEvents([]);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await handleSubmit('/logout', {});
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects like socialLinks.linkedin
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should not exceed 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
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
        // Update the profile data with the new photo URL
        setProfileData(prev => ({
          ...prev,
          photo: data.url
        }));
      } else {
        alert(data.message || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading photo');
    }
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update user in context
        setUser(prev => ({
          ...prev,
          ...data.data
        }));
        
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          ...data.data
        }));
        
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(`Error: ${data.message || 'Failed to update profile'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating your profile');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="text-red-500 text-center">
              <p>{error}</p>
              <button 
                onClick={fetchData}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto ">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Profile Section */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                <FaUser className="inline mr-2" />
                User Profile
              </h3>
              <div className="flex gap-4 space-x-2 ">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium  text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 !rounded-4xl"
                >
                  <FaEdit className="mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium !rounded-4xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <FaSignOutAlt className="mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6 bg-gradient-to-br from-gray-900 to-gray-800">
            <div >
              {/* User Info */}
              {isEditing ? (
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
                  <h4 className="text-md font-medium  mb-4">Edit Profile</h4>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Bio</label>
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Profile Photo</label>
                      {profileData.photo ? (
                        <div className="mt-2 flex items-center space-x-4">
                          <img 
                            src={profileData.photo} 
                            alt="Profile" 
                            className="h-16 w-16 rounded-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setProfileData(prev => ({ ...prev, photo: '' }))}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <div className="flex text-sm text-gray-400">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-red-400 hover:text-red-300 focus-within:outline-none"
                              >
                                <span>Upload a file</span>
                                <input 
                                  id="file-upload" 
                                  name="file-upload" 
                                  type="file" 
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">LinkedIn</label>
                      <input
                        type="text"
                        name="socialLinks.linkedin"
                        value={profileData.socialLinks.linkedin}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/username"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Portfolio</label>
                      <input
                        type="text"
                        name="socialLinks.portfolio"
                        value={profileData.socialLinks.portfolio}
                        onChange={handleInputChange}
                        placeholder="https://yourportfolio.com"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-4xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-xl mb-6 border-t-4 border-b-4 border-indigo-500 text-gray-100">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">Personal Information</h4>
                  <div className="flex flex-col md:flex-row">
                    {user?.photo ? (
                      <div className="mb-4 md:mb-0 md:mr-6">
                        <img 
                          src={user.photo && user.photo.startsWith('http') ? user.photo : `${import.meta.env.VITE_API_URL}${user.photo}`} 
                          alt={user.name} 
                          className="w-32 h-32 rounded-full object-cover border-2 border-blue-500 shadow-md"
                          onError={(e) => {
                            console.error('Image failed to load:', e.target.src);
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '<div class="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center"><span class="text-gray-400 text-4xl">'+user.name?.charAt(0).toUpperCase()+'</span></div>';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="mb-4 md:mb-0 md:mr-6">
                        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-2 border-blue-500 shadow-md">
                          <FaUser className="text-gray-400 text-4xl" />
                        </div>
                      </div>
                    )}
                    <div className="space-y-3 flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className=" p-3 rounded">
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">{user?.name || 'Not provided'}</p>
                        </div>
                        <div className=" p-3 rounded">
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{user?.email || 'Not provided'}</p>
                        </div>
                        <div className=" p-3 rounded">
                          <p className="text-sm text-gray-500">Role</p>
                          <p className="font-medium">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Not provided'}</p>
                        </div>
                        <div className=" p-3 rounded">
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{user?.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      
                      {user?.bio && (
                        <div className="p-3 rounded">
                          <p className="text-sm text-gray-500">Bio</p>
                          <p className="font-medium">{user.bio}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user?.socialLinks?.linkedin && (
                          <a 
                            href={user.socialLinks.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                          >
                            LinkedIn
                          </a>
                        )}
                        {user?.socialLinks?.portfolio && (
                          <a 
                            href={user.socialLinks.portfolio} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                          >
                            Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-3">
  {/* Upcoming Events */}
  <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-xl mb-6 border-l-4 border-r-4 border-indigo-500 text-gray-100">
    <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
      <FaCalendarAlt className="mr-2 text-blue-600" />
      Upcoming Events
    </h4>
    {events.length > 0 ? (
      <ul className="divide-y divide-gray-200">
        {events.map(event => (
          <li
            key={event._id}
            className="py-3 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium ">{event.title}</p>
                <p className="text-sm ">
                  {new Date(event.date).toLocaleDateString()} •{" "}
                  {event.location || "Location TBA"}
                </p>
              </div>
              <button
                onClick={() => navigate(`/events/${event._id}`)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View
              </button>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No upcoming events found.</p>
        <button
          onClick={() => navigate("/events")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Browse Events
        </button>
      </div>
    )}
  </div>

  {/* Registered Events */}
  <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-xl mb-6 border-l-4 border-r-4 border-indigo-500 text-gray-100">
    <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
      <FaRegCalendarCheck className="mr-2 text-blue-600" />
      My Registered Events & Sub-Events
    </h4>
    {registeredEvents.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {registeredEvents.map(event => (
              <tr
                key={event.id}
                className="transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-300">
                    {event.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    event.type === 'subevent' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {event.type === 'subevent' ? 'Sub-Event' : 'Main Event'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                  <button
                    onClick={() => {
                      // Navigate to the event with sub-event ID in the URL hash if it's a sub-event
                      const url = event.type === 'subevent' 
                        ? `/events/${event.eventId}#${event.subEventId}`
                        : `/events/${event.eventId}`;
                      navigate(url);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">
          You haven't registered for any events yet.
        </p>
        <button
          onClick={() => navigate("/events")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Browse Events
        </button>
      </div>
    )}
  </div>
</div>

              
              {/* Liked Events */}
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-xl mb-6 border-t-4 border-b-4 border-indigo-500 text-gray-100">
                <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
                  <FaHeart className="mr-2 text-red-500" />
                  My Liked Events
                </h4>
                {likedEvents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead >
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Event</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className=" divide-y divide-gray-200">
                        {likedEvents.map(event => (
                          <tr key={event.id} className=" transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium ">{event.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm ">
                              {event.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm ">
                              {event.location}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm ">
                              <button 
                                onClick={() => navigate(`/events/${event.id}`)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't liked any events yet.</p>
                    <button 
                      onClick={() => navigate('/events')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Browse Events
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
