import { motion } from 'framer-motion';
import { useContext, useEffect, useState } from 'react';
import { FaCalendarAlt, FaImage, FaLink, FaMapMarkerAlt, FaPlus, FaTrash, FaUserFriends, FaUpload } from 'react-icons/fa';
import AuthContext from '../../AuthContext/AuthContext';
import { showError, showSuccess } from '../../utils/toast';

const CreateEvent = ({ onEventCreated, editingEvent }) => {
  const { handleSubmit, user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    imageUrl: '',
    uploadedImageUrl: '',
    category: '',
    coordinators: [{ name: '', contact: '' }],
    links: [{ title: '', url: '', uploadedFileUrl: '', isFile: false }],
    subEvents: []
  });
  
  // State for a new sub-event
  const [subEvent, setSubEvent] = useState({
    name: '',
    date: '',
    venue: '',
    description: '',
    rules: '',
    coordinators: [{ name: '', contact: '' }],
    fee: 0,
    prize: ''
  });
  
  // Populate form when editing an event
  useEffect(() => {
    if (editingEvent) {
      console.log('Editing event:', editingEvent);
      // Format date for datetime-local input
      let formattedDate = '';
      if (editingEvent.date) {
        const date = new Date(editingEvent.date);
        formattedDate = date.toISOString().slice(0, 16);
      }
      
      setFormData({
        title: editingEvent.title || '',
        description: editingEvent.description || '',
        date: formattedDate,
        location: editingEvent.location || '',
        imageUrl: editingEvent.imageUrl || '',
        category: editingEvent.category || '',
        coordinators: editingEvent.coordinators?.length > 0 ? editingEvent.coordinators : [{ name: '', contact: '' }],
        links: editingEvent.links?.length > 0 ? editingEvent.links : [{ title: '', url: '' }],
        subEvents: editingEvent.subEvents || []
      });
    }
  }, [editingEvent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle coordinator changes
  const handleCoordinatorChange = (index, field, value) => {
    const updatedCoordinators = [...formData.coordinators];
    updatedCoordinators[index] = {
      ...updatedCoordinators[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      coordinators: updatedCoordinators
    }));
  };
  
  // Add a new coordinator field
  const addCoordinator = () => {
    setFormData(prev => ({
      ...prev,
      coordinators: [...prev.coordinators, { name: '', contact: '' }]
    }));
  };
  
  // Remove a coordinator field
  const removeCoordinator = (index) => {
    if (formData.coordinators.length > 1) {
      const updatedCoordinators = formData.coordinators.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        coordinators: updatedCoordinators
      }));
    }
  };
  
  // Handle link changes
  const handleLinkChange = (index, field, value) => {
    const updatedLinks = [...formData.links];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      links: updatedLinks
    }));
  };

  // Handle link file upload
  const handleLinkFileUpload = async (index, file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showError('File size should not exceed 5MB');
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('photo', file);

    try {
      setIsLoading(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: uploadFormData
      });

      const data = await response.json();
      
      if (response.ok) {
        // Construct full URL for the image
        const fullImageUrl = data.url.startsWith('http') 
          ? data.url 
          : `${import.meta.env.VITE_API_URL}${data.url}`;

        const updatedLinks = [...formData.links];
        updatedLinks[index] = {
          ...updatedLinks[index],
          uploadedFileUrl: fullImageUrl,
          url: fullImageUrl,
          isFile: true
        };
        setFormData(prev => ({
          ...prev,
          links: updatedLinks
        }));
        showSuccess('File uploaded successfully!');
      } else {
        showError(data.message || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showError('Error uploading file');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear link uploaded file
  const clearLinkFile = (index) => {
    const updatedLinks = [...formData.links];
    updatedLinks[index] = {
      ...updatedLinks[index],
      uploadedFileUrl: '',
      url: '',
      isFile: false
    };
    setFormData(prev => ({
      ...prev,
      links: updatedLinks
    }));
  };
  
  // Add a new link field
  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { title: '', url: '', uploadedFileUrl: '', isFile: false }]
    }));
  };
  
  // Remove a link field
  const removeLink = (index) => {
    if (formData.links.length > 1) {
      const updatedLinks = formData.links.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        links: updatedLinks
      }));
    }
  };
  
  // Handle sub-event changes
  const handleSubEventChange = (e) => {
    const { name, value } = e.target;
    setSubEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle sub-event coordinator changes
  const handleSubEventCoordinatorChange = (index, field, value) => {
    const updatedCoordinators = [...subEvent.coordinators];
    updatedCoordinators[index] = {
      ...updatedCoordinators[index],
      [field]: value
    };
    setSubEvent(prev => ({
      ...prev,
      coordinators: updatedCoordinators
    }));
  };
  
  // Add a new sub-event coordinator field
  const addSubEventCoordinator = () => {
    setSubEvent(prev => ({
      ...prev,
      coordinators: [...prev.coordinators, { name: '', contact: '' }]
    }));
  };
  
  // Remove a sub-event coordinator field
  const removeSubEventCoordinator = (index) => {
    if (subEvent.coordinators.length > 1) {
      const updatedCoordinators = subEvent.coordinators.filter((_, i) => i !== index);
      setSubEvent(prev => ({
        ...prev,
        coordinators: updatedCoordinators
      }));
    }
  };
  
  // Add a sub-event to the main event
  const addSubEvent = () => {
    // Basic validation
    if (!subEvent.name || !subEvent.date || !subEvent.venue || !subEvent.description) {
      showError('Please fill in all required fields for the sub-event');
      return;
    }
    
    // Format date for storage
    const formattedSubEvent = {
      ...subEvent,
      date: subEvent.date ? new Date(subEvent.date).toISOString() : undefined
    };
    
    setFormData(prev => ({
      ...prev,
      subEvents: [...prev.subEvents, formattedSubEvent]
    }));
    
    // Reset sub-event form
    setSubEvent({
      name: '',
      date: '',
      venue: '',
      description: '',
      rules: '',
      coordinators: [{ name: '', contact: '' }],
      fee: 0,
      prize: ''
    });
  };
  
  // Remove a sub-event
  const removeSubEvent = (index) => {
    const updatedSubEvents = formData.subEvents.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      subEvents: updatedSubEvents
    }));
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showError('File size should not exceed 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file); // Changed from 'image' to 'photo' to match backend

    try {
      setIsLoading(true);
      setUploadProgress(0);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        // Construct full URL for the image
        const fullImageUrl = data.url.startsWith('http') 
          ? data.url 
          : `${import.meta.env.VITE_API_URL}${data.url}`;

        setFormData(prev => ({
          ...prev,
          uploadedImageUrl: fullImageUrl,
          imageUrl: fullImageUrl // Also set the URL field
        }));
        showSuccess('Image uploaded successfully!');
      } else {
        showError(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showError('Error uploading image');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // Clear uploaded image
  const clearUploadedImage = () => {
    setFormData(prev => ({
      ...prev,
      uploadedImageUrl: '',
      imageUrl: ''
    }));
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.date || !formData.category || !formData.location) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      const isEditing = !!editingEvent;
      // Make sure we have a valid ID for the event
      const eventId = editingEvent?._id || editingEvent?.id;
      console.log('Event ID for API call:', eventId);
      
      // Ensure we have a valid ID before attempting to edit
      if (isEditing && !eventId) {
        showError('Cannot edit event: Missing event ID');
        setIsLoading(false);
        return;
      }
      
      const url = isEditing
        ? `${import.meta.env.VITE_API_URL}/api/events/${eventId}` 
        : `${import.meta.env.VITE_API_URL}/api/events`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      // Log the request details
      console.log('Making API request:', {
        url,
        method,
        formData
      });
      
      // Ensure date is in ISO format for the API
      const apiFormData = {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : undefined
      };
      
      console.log('Formatted data for API:', apiFormData);
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(apiFormData)
      });

      const data = await response.json();
      console.log('API Response:', { status: response.status, data, formData, eventId });

      if (response.ok) {
        showSuccess(isEditing ? 'Event updated successfully!' : 'Event created successfully! Awaiting approval.');
        // Reset form
        setFormData({
          title: '',
          description: '',
          date: '',
          location: '',
          imageUrl: '',
          category: '',
          coordinators: [{ name: '', contact: '' }],
          links: [{ title: '', url: '' }],
          subEvents: []
        });
        
        // Notify parent component
        if (onEventCreated) {
          onEventCreated(data.data || data);
        }
      } else {
        showError(data.message || `Failed to ${isEditing ? 'update' : 'create'} event`);
      }
    } catch (error) {
      console.error(`${editingEvent ? 'Update' : 'Create'} event error:`, error);
      showError(`An error occurred while ${editingEvent ? 'updating' : 'creating'} the event`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700"
    >
      <h2 className="text-2xl font-bold text-white mb-6">{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
      
      <form onSubmit={handleSubmitEvent} className="space-y-6">
        {/* Main Event Details */}
        <div className="bg-gray-700 p-4 rounded-md">
          <h3 className="text-xl font-semibold text-white mb-4">Main Event Details</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter event name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Describe your event"
                required
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
                  <FaCalendarAlt className="inline mr-1" /> Date and Time *
                </label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
                  <FaMapMarkerAlt className="inline mr-1" /> Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Event location"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                <FaImage className="inline mr-1" /> Event Photo
              </label>
              
              {/* Direct Upload Option */}
              <div className="mb-3">
                <label className="flex items-center justify-center w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md text-white hover:bg-gray-500 cursor-pointer transition-colors">
                  <FaImage className="mr-2" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    name="eventImage"
                    onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                  />
                </label>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Uploading... {uploadProgress}%</p>
                  </div>
                )}
              </div>
              
              {/* URL Option (Alternative) */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-400 mb-1">OR use URL:</label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="https://example.com/image.jpg"
                  disabled={formData.uploadedImageUrl}
                />
              </div>
              
              {/* Preview */}
              {(formData.imageUrl || formData.uploadedImageUrl) && (
                <div className="mt-2">
                  <p className="text-sm text-gray-300 mb-1">Preview:</p>
                  <img 
                    src={formData.uploadedImageUrl || formData.imageUrl} 
                    alt="Event preview" 
                    className="w-full h-32 object-cover rounded-md border border-gray-500"
                  />
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select a category</option>
                <option value="workshop">Workshop</option>
                <option value="conference">Conference</option>
                <option value="meetup">Meetup</option>
                <option value="hackathon">Hackathon</option>
                <option value="webinar">Webinar</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Coordinators Section */}
        <div className="bg-gray-700 p-4 rounded-md">
          <h3 className="text-xl font-semibold text-white mb-4">
            <FaUserFriends className="inline mr-2" /> Coordinators
          </h3>
          
          {formData.coordinators.map((coordinator, index) => (
            <div key={`coordinator-${index}`} className="mb-4 p-3 bg-gray-600 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-white">Coordinator {index + 1}</h4>
                {formData.coordinators.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeCoordinator(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={coordinator.name}
                    onChange={(e) => handleCoordinatorChange(index, 'name', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Coordinator name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Contact
                  </label>
                  <input
                    type="text"
                    value={coordinator.contact}
                    onChange={(e) => handleCoordinatorChange(index, 'contact', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Phone or email"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addCoordinator}
            className="mt-2 flex items-center text-red-400 hover:text-red-300"
          >
            <FaPlus className="mr-1" /> Add Another Coordinator
          </button>
        </div>
        
        {/* Links Section */}
        <div className="bg-gray-700 p-4 rounded-md">
          <h3 className="text-xl font-semibold text-white mb-4">
            <FaLink className="inline mr-2" /> Links
          </h3>
          
          {formData.links.map((link, index) => (
            <div key={`link-${index}`} className="mb-4 p-3 bg-gray-600 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-white">Link {index + 1}</h4>
                {formData.links.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeLink(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Link title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    URL or File
                  </label>
                  <div className="space-y-2">
                    {link.uploadedFileUrl ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                          <img 
                            src={link.uploadedFileUrl} 
                            alt={link.title || 'Link image'} 
                            className="h-12 w-12 object-cover rounded"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => clearLinkFile(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLinkFileUpload(index, e.target.files[0])}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          disabled={isLoading}
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="https://example.com"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addLink}
            className="mt-2 flex items-center text-red-400 hover:text-red-300"
          >
            <FaPlus className="mr-1" /> Add Another Link
          </button>
        </div>
        
        {/* Sub-Events Section */}
        <div className="bg-gray-700 p-4 rounded-md">
          <h3 className="text-xl font-semibold text-white mb-4">Sub-Events</h3>
          
          {/* List of added sub-events */}
          {formData.subEvents.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-medium text-white mb-3">Added Sub-Events:</h4>
              
              <div className="space-y-3">
                {formData.subEvents.map((subEvent, index) => (
                  <div key={`subevent-${index}`} className="p-3 bg-gray-600 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-white font-medium">{subEvent.name}</h5>
                      <button 
                        type="button" 
                        onClick={() => removeSubEvent(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <div className="text-gray-300 text-sm">
                      <p><strong>Date:</strong> {new Date(subEvent.date).toLocaleString()}</p>
                      <p><strong>Venue:</strong> {subEvent.venue}</p>
                      {subEvent.fee > 0 && <p><strong>Fee:</strong> ${subEvent.fee}</p>}
                      {subEvent.prize && <p><strong>Prize:</strong> {subEvent.prize}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add new sub-event form */}
          <div className="bg-gray-600 p-4 rounded-md">
            <h4 className="text-lg font-medium text-white mb-3">Add New Sub-Event</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={subEvent.name}
                  onChange={handleSubEventChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Sub-event name"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <FaCalendarAlt className="inline mr-1" /> Date and Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={subEvent.date}
                    onChange={handleSubEventChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <FaMapMarkerAlt className="inline mr-1" /> Venue *
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={subEvent.venue}
                    onChange={handleSubEventChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Sub-event venue"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={subEvent.description}
                  onChange={handleSubEventChange}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Describe the sub-event"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Rules
                </label>
                <textarea
                  name="rules"
                  value={subEvent.rules}
                  onChange={handleSubEventChange}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Rules for the sub-event"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Fee (optional)
                  </label>
                  <input
                    type="number"
                    name="fee"
                    value={subEvent.fee}
                    onChange={handleSubEventChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Prize (optional)
                  </label>
                  <input
                    type="text"
                    name="prize"
                    value={subEvent.prize}
                    onChange={handleSubEventChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Prize details"
                  />
                </div>
              </div>
              
              {/* Sub-event coordinators */}
              <div>
                <h5 className="text-md font-medium text-white mb-2">Coordinators</h5>
                
                {subEvent.coordinators.map((coordinator, index) => (
                  <div key={`sub-coordinator-${index}`} className="mb-3 p-3 bg-gray-700 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h6 className="text-white">Coordinator {index + 1}</h6>
                      {subEvent.coordinators.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeSubEventCoordinator(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={coordinator.name}
                          onChange={(e) => handleSubEventCoordinatorChange(index, 'name', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Coordinator name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Contact
                        </label>
                        <input
                          type="text"
                          value={coordinator.contact}
                          onChange={(e) => handleSubEventCoordinatorChange(index, 'contact', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Phone or email"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addSubEventCoordinator}
                  className="mt-2 flex items-center text-red-400 hover:text-red-300"
                >
                  <FaPlus className="mr-1" /> Add Another Coordinator
                </button>
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={addSubEvent}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Add Sub-Event
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-md transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (editingEvent ? 'Updating...' : 'Creating...') : (editingEvent ? 'Update Event' : 'Create Event')}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateEvent;