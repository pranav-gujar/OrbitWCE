import { motion } from 'framer-motion';
import { useContext, useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaLink, FaMapMarkerAlt, FaUpload, FaUserFriends } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { AuthContext } from '../../AuthContext/AuthContext';

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [selectedSubEvent, setSelectedSubEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    email: '',
    phone: '',
    instituteName: '',
    degree: '',
    branch: '',
    year: '',
    idCard: null,
    transactionId: ''
  });
  const [idCardPreview, setIdCardPreview] = useState(null);

  // Function to fetch event data
  const fetchEvent = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      // Fetch event data from API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${id}`, {
        method: 'GET',
        headers
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Transform API data to match our component's expected format
        const eventData = data.data;
        
        // If no event data or it's not approved (for non-admin users)
        if (!eventData) {
          setError('Event not found');
          setLoading(false);
          return;
        }
        
        // Use the fetched data, with fallbacks for optional fields
        setEvent({
          id: eventData._id,
          title: eventData.title,
          date: eventData.date,
          description: eventData.description,
          location: eventData.venue,
          imageUrl: eventData.imageUrl || 'https://images.unsplash.com/photo-1505373877841-8d25f96d5538?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
          category: eventData.category,
          coordinators: eventData.coordinators || [],
          links: eventData.links || [],
          subEvents: eventData.subEvents || [],
          attendees: eventData.attendees || 0,
          registrations: eventData.registrations || [],
          gallery: eventData.gallery && eventData.gallery.length > 0 
            ? eventData.gallery 
            : [eventData.imageUrl || 'https://images.unsplash.com/photo-1505373877841-8d25f96d5538?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80']
        });
        
        // Check if user is already registered
        if (user && eventData.registrations && eventData.registrations.length > 0) {
          const userRegistered = eventData.registrations.some(reg => reg.email === user.email);
          setIsRegistered(userRegistered);
        }
      } else {
        setError(data.message || 'Failed to load event details');
      }
    } catch (err) {
      setError('Failed to load event details');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleRegistrationOpen = (subEvent) => {
    setSelectedSubEvent(subEvent);
    setRegistrationOpen(true);
    
    // Pre-fill form with user data if available
    if (user) {
      setRegistrationForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  };

  const handleRegistrationClose = () => {
    setRegistrationOpen(false);
    setSelectedSubEvent(null);
  };

  const handleRegistrationChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        setRegistrationForm(prev => ({
          ...prev,
          [name]: file
        }));
        
        // Create preview URL for ID card
        const previewUrl = URL.createObjectURL(file);
        setIdCardPreview(previewUrl);
      }
    } else {
      setRegistrationForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    try {
      // Show loading state
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...token && { 'Authorization': `Bearer ${token}` }
      };
      
      // Prepare registration data
      const registrationData = {
        name: registrationForm.name,
        email: registrationForm.email,
        phone: registrationForm.phone,
        instituteName: registrationForm.instituteName,
        degree: registrationForm.degree,
        branch: registrationForm.branch,
        year: registrationForm.year,
        transactionId: registrationForm.transactionId || 'N/A', // Provide default value if empty
        ...(selectedSubEvent && { subEventId: selectedSubEvent._id })
      };
      
      console.log('Submitting registration data:', registrationData);
      
      // Submit registration to API
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/events/${id}/register`;
      console.log('Sending registration to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(registrationData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration failed:', errorData);
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const data = await response.json();
      
      if (response.ok) {
        // Show success message
        alert('Registration successful! A confirmation email has been sent to your email address.');
        
        // Set registration status
        setIsRegistered(true);
        
        // Reset form and close modal
        setRegistrationForm({
          name: '',
          email: '',
          phone: '',
          instituteName: '',
          degree: '',
          branch: '',
          year: '',
          idCard: null,
          transactionId: ''
        });
        setIdCardPreview(null);
        handleRegistrationClose();
        
        // Refresh event data to update attendees count
        fetchEvent();
        
        // Open Google Calendar link in a new tab
        if (data.data && data.data.calendarUrl) {
          window.open(data.data.calendarUrl, '_blank');
        }
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      alert(`Registration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
    
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-red-500">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <Link to="/events" className="mt-4 inline-block text-white hover:text-red-400">
            <FaArrowLeft className="inline mr-2" /> Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <Link to="/events" className="mt-4 inline-block text-white hover:text-red-400">
            <FaArrowLeft className="inline mr-2" /> Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Event Poster (Main Banner) */}
      <div className="w-full h-[50vh] relative">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8">
          <div className="container mx-auto">
            <Link to="/events" className="inline-block mb-4 text-white hover:text-red-400 transition-colors">
              <FaArrowLeft className="inline mr-2" /> Back to Events
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Event Info Section */}
        <motion.section 
          className="mb-12 bg-gray-800 rounded-lg p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Event Details</h2>
              <div className="mb-4 flex items-center text-gray-300">
                <FaCalendarAlt className="mr-2" />
                <span>{new Date(event.date).toLocaleString()}</span>
              </div>
              <div className="mb-6 flex items-center text-gray-300">
                <FaMapMarkerAlt className="mr-2" />
                <span>{event.location}</span>
              </div>
              
              {/* Show attendees count for community role users */}
              {user && user.role === 'community' && (
                <div className="mb-6 flex items-center text-gray-300">
                  <FaUserFriends className="mr-2" />
                  <span>Attending: {event.attendees}</span>
                </div>
              )}
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300">{event.description}</p>
              </div>
              
              {/* Main Register Now button - only shown to users with 'user' role */}
              {(!user || user.role === 'user') && (
                isRegistered ? (
                  <button
                    disabled
                    className="mt-6 bg-green-600 text-white font-medium py-2 px-6 rounded-md cursor-not-allowed"
                  >
                    Event Registered
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegistrationOpen(null)}
                    className="mt-6 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                  >
                    Register Now
                  </button>
                )
              )}
            </div>
            
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Main Coordinators</h3>
                <div className="space-y-3">
                  {event.coordinators.map((coordinator, index) => (
                    <div key={index} className="flex items-start">
                      <FaUserFriends className="mt-1 mr-2 text-red-400" />
                      <div>
                        <p className="font-medium">{coordinator.name}</p>
                        <p className="text-sm text-gray-400">{coordinator.contact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {event.links && event.links.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Links</h3>
                  <div className="space-y-2">
                    {event.links.map((link, index) => (
                      <a 
                        key={index} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-red-400 hover:text-red-300 transition-colors"
                      >
                        <FaLink className="mr-2" />
                        <span>{link.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Sub-Events Section */}
        {event.subEvents && event.subEvents.length > 0 && (
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-6">Sub-Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.subEvents.map((subEvent, index) => (
                <div 
                  key={index} 
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-[1.02]"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{subEvent.name}</h3>
                    <div className="mb-3 text-gray-300 text-sm">
                      <div className="flex items-center mb-1">
                        <FaCalendarAlt className="mr-2" />
                        <span>{new Date(subEvent.date).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>{subEvent.venue}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-300 mb-2">{subEvent.description}</p>
                      {subEvent.rules && (
                        <div className="mt-2">
                          <p className="font-medium">Rules:</p>
                          <p className="text-gray-400 text-sm">{subEvent.rules}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      {subEvent.coordinators && subEvent.coordinators.length > 0 && (
                        <div className="mb-2">
                          <p className="font-medium">Coordinators:</p>
                          {subEvent.coordinators.map((coordinator, idx) => (
                            <p key={idx} className="text-gray-400 text-sm">
                              {coordinator.name} - {coordinator.contact}
                            </p>
                          ))}
                        </div>
                      )}
                      
                      {subEvent.fee > 0 && (
                        <p className="text-gray-300 text-sm">
                          <span className="font-medium">Fee:</span> ${subEvent.fee}
                        </p>
                      )}
                      
                      {subEvent.prize && (
                        <p className="text-gray-300 text-sm">
                          <span className="font-medium">Prize:</span> {subEvent.prize}
                        </p>
                      )}
                    </div>
                    
                    {/* Register Now button - only shown to users with 'user' role */}
                    
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Photo Gallery Section */}
        {event.gallery && event.gallery.length > 1 && (
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-6">Photo Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {event.gallery.slice(1).map((photo, index) => (
                <div 
                  key={index} 
                  className="aspect-square overflow-hidden rounded-lg"
                >
                  <img 
                    src={photo} 
                    alt={`Event photo ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Registration Modal */}
      {registrationOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              Register for {selectedSubEvent ? selectedSubEvent.name : event.title}
            </h3>
            
            <form onSubmit={handleRegistrationSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="border border-gray-700 rounded-md p-4">
                <h4 className="text-lg font-semibold mb-3 text-red-400">Personal Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={registrationForm.name}
                      onChange={handleRegistrationChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={registrationForm.email}
                      onChange={handleRegistrationChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={registrationForm.phone}
                      onChange={handleRegistrationChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Academic Information Section */}
              <div className="border border-gray-700 rounded-md p-4">
                <h4 className="text-lg font-semibold mb-3 text-red-400">Academic Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Institute Name *
                    </label>
                    <input
                      type="text"
                      name="instituteName"
                      value={registrationForm.instituteName}
                      onChange={handleRegistrationChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter your institute name"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Degree *
                      </label>
                      <input
                        type="text"
                        name="degree"
                        value={registrationForm.degree}
                        onChange={handleRegistrationChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="B.Tech, M.Tech, etc."
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Branch *
                      </label>
                      <input
                        type="text"
                        name="branch"
                        value={registrationForm.branch}
                        onChange={handleRegistrationChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="CSE, ECE, etc."
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Year *
                      </label>
                      <input
                        type="text"
                        name="year"
                        value={registrationForm.year}
                        onChange={handleRegistrationChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="1st, 2nd, etc."
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* ID Card Upload Section */}
              <div className="border border-gray-700 rounded-md p-4">
                <h4 className="text-lg font-semibold mb-3 text-red-400">ID Card Upload</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Upload College/Institute ID Card *
                    </label>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center justify-center px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white hover:bg-gray-600 cursor-pointer transition-colors">
                        <FaUpload className="mr-2" />
                        <span>Choose File</span>
                        <input
                          type="file"
                          name="idCard"
                          onChange={handleRegistrationChange}
                          className="hidden"
                          accept="image/*"
                          required
                        />
                      </label>
                      <span className="text-sm text-gray-400">
                        {registrationForm.idCard ? registrationForm.idCard.name : 'No file chosen'}
                      </span>
                    </div>
                  </div>
                  
                  {idCardPreview && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-300 mb-1">Preview:</p>
                      <div className="border border-gray-600 rounded-md overflow-hidden max-w-xs">
                        <img 
                          src={idCardPreview} 
                          alt="ID Card Preview" 
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Payment Information Section */}
              <div className="border border-gray-700 rounded-md p-4">
                <h4 className="text-lg font-semibold mb-3 text-red-400">Payment Information</h4>
                <div className="space-y-3">
                  <div className="bg-gray-700 p-3 rounded-md mb-3">
                    {/* <p className="text-sm font-medium mb-2">
                      Registration Fee: ${selectedSubEvent?.fee || 0}
                    </p> */}
                    <div className="flex flex-col items-center">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
                        alt="Payment QR Code" 
                        className="w-48 h-48 bg-white p-2 rounded-md mb-2"
                      />
                      <p className="text-xs text-gray-400 text-center">
                        Scan this QR code to make payment. After payment, enter the transaction ID below.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Transaction ID *
                    </label>
                    <input
                      type="text"
                      name="transactionId"
                      value={registrationForm.transactionId}
                      onChange={handleRegistrationChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter transaction ID"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleRegistrationClose}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                  Complete Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;