import { motion } from 'framer-motion';
import { useContext, useEffect, useRef, useState } from 'react';
import { FaCalendarAlt, FaImage, FaLink, FaMapMarkerAlt, FaPlus, FaTrash, FaUserFriends, FaUpload, FaMagic } from 'react-icons/fa';
import { createWorker } from 'tesseract.js';
import AuthContext from '../../AuthContext/AuthContext';
import { showError, showSuccess, showInfo } from '../../utils/toast';

// Helper function to load OpenCV
const loadOpenCV = () => {
  return new Promise((resolve) => {
    if (window.cv) {
      resolve(true);
    } else {
      const script = document.createElement('script');
      script.src = 'https://docs.opencv.org/4.5.5/opencv.js';
      script.async = true;
      script.onload = () => {
        // Wait for OpenCV to be ready
        const checkCV = setInterval(() => {
          if (window.cv) {
            clearInterval(checkCV);
            resolve(true);
          }
        }, 100);
      };
      script.onerror = () => {
        console.error('Failed to load OpenCV');
        resolve(false);
      };
      document.body.appendChild(script);
    }
  });
};

// Preprocess image with OpenCV
const preprocessImage = async (imageUrl) => {
  try {
    // Load the image
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw image on canvas
    ctx.drawImage(img, 0, 0, img.width, img.height);
    
    // Convert to OpenCV format
    const src = cv.imread(canvas);
    const dst = new cv.Mat();
    
    // Convert to grayscale
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
    
    // Apply thresholding
    cv.threshold(dst, dst, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
    
    // Apply slight blur to reduce noise
    const ksize = new cv.Size(3, 3);
    cv.GaussianBlur(dst, dst, ksize, 0);
    
    // Convert back to image URL
    cv.imshow(canvas, dst);
    const processedImageUrl = canvas.toDataURL('image/jpeg', 1.0);
    
    // Clean up
    src.delete();
    dst.delete();
    
    return processedImageUrl;
  } catch (error) {
    console.error('Error in image preprocessing:', error);
    return imageUrl; // Return original if preprocessing fails
  }
};

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
  
  const [isExtractingText, setIsExtractingText] = useState(false);
  const fileInputRef = useRef(null);
  
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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/upload`, {
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

  // Extract text from image using Tesseract.js with OpenCV preprocessing
  const extractTextFromImage = async (imageUrl) => {
    setIsExtractingText(true);
    showInfo('Processing image for better text recognition...');
    
    try {
      // Load OpenCV
      const openCvLoaded = await loadOpenCV();
      let processedImageUrl = imageUrl;
      
      // Preprocess image with OpenCV if available
      if (openCvLoaded) {
        showInfo('Enhancing image for better text recognition...');
        processedImageUrl = await preprocessImage(imageUrl);
      }
      
      showInfo('Extracting text from image...');
      console.log('Starting Tesseract worker...');
      const worker = await createWorker('eng');
      
      // Configure Tesseract for better recognition
      await worker.setParameters({
        tessedit_pageseg_mode: '6', // Assume a single uniform block of text
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:;-/()@&$"\'!?',
        preserve_interword_spaces: '1',
      });
      
      console.log('Worker created, recognizing text...');
      const { data: { text } } = await worker.recognize(processedImageUrl);
      await worker.terminate();
      
      console.log('=== EXTRACTED TEXT ===');
      console.log(text);
      console.log('=== END EXTRACTED TEXT ===');
      
      if (!text || text.trim().length === 0) {
        console.error('No text was extracted from the image');
        showError('Could not extract any text from the image. Please try another image or enter details manually.');
        return null;
      }
      
      // Common event categories to look for
      const commonCategories = [
        'conference', 'workshop', 'seminar', 'meetup', 'hackathon',
        'exhibition', 'concert', 'festival', 'webinar', 'competition',
        'tech talk', 'networking', 'convention', 'symposium', 'summit',
        'expo', 'fair', 'show', 'performance', 'gala', 'award', 'party'
      ];
      
      // Common location words to look for
      const locationKeywords = [
        'hall', 'center', 'theater', 'auditorium', 'stadium', 'convention',
        'university', 'college', 'school', 'hotel', 'restaurant', 'cafe',
        'bar', 'club', 'garden', 'park', 'plaza', 'mall', 'library', 'lobby',
        'room', 'theatre', 'arena', 'stadium', 'field', 'ground', 'lounge'
      ];
      
      // Common date indicators
      const dateIndicators = ['date', 'when', 'time', 'on', 'at', 'from', 'to'];
      
      // Common location indicators
      const locationIndicators = ['venue', 'location', 'place', 'where', 'address', 'at'];
      
      // Common category indicators
      const categoryIndicators = ['type', 'category', 'event type', 'event category', 'kind', 'format'];
      
      // Helper function to find value after indicators
      const findValueAfterIndicators = (text, indicators) => {
        const lines = text.split('\n').map(line => line.trim());
        
        // First, check if any line starts with an indicator
        for (const line of lines) {
          const lowerLine = line.toLowerCase();
          for (const indicator of indicators) {
            if (lowerLine.startsWith(indicator.toLowerCase() + ':')) {
              return line.substring(indicator.length + 1).trim();
            } else if (lowerLine.startsWith(indicator.toLowerCase() + ' ')) {
              return line.substring(indicator.length).trim();
            }
          }
        }
        
        // Then check for indicators within lines
        for (const line of lines) {
          const lowerLine = line.toLowerCase();
          for (const indicator of indicators) {
            const idx = lowerLine.indexOf(indicator.toLowerCase() + ':');
            if (idx !== -1) {
              return line.substring(idx + indicator.length + 1).trim();
            }
          }
        }
        
        return null;
      };
      
      // Parse the extracted text to find relevant information
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      console.log('Found', lines.length, 'non-empty lines of text');
      
      // Initialize with current form data
      const extractedData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        category: formData.category
      };
      
      console.log('Initial form data:', extractedData);
      
      // Try to find title first (first non-empty line)
      if (lines.length > 0 && !formData.title) {
        extractedData.title = lines[0].trim();
        console.log('Set title from first line:', extractedData.title);
      }
      
      // Try to find date using indicators first
      console.log('Looking for date indicators in text...');
      const dateFromIndicators = findValueAfterIndicators(text, dateIndicators);
      if (dateFromIndicators) {
        console.log('Found date from indicators:', dateFromIndicators);
        try {
          // First try parsing as is
          let date = new Date(dateFromIndicators);
          
          // If that fails, try cleaning up the date string
          if (isNaN(date.getTime())) {
            // Remove ordinal indicators (st, nd, rd, th)
            const cleanedDate = dateFromIndicators
              .replace(/(\d+)(st|nd|rd|th)/g, '$1')
              .replace(/\s+/g, ' ')
              .trim();
            date = new Date(cleanedDate);
          }
          
          if (!isNaN(date.getTime())) {
            extractedData.date = date.toISOString().slice(0, 16);
            console.log('Successfully parsed date:', extractedData.date);
          } else {
            console.log('Invalid date format from indicators');
          }
        } catch (e) {
          console.log('Date parsing error from indicators:', e);
        }
      } else {
        console.log('No date found using indicators');
      }
      
      // If no date found from indicators, try patterns
      if (!extractedData.date) {
        const datePatterns = [
          // Full month name with day and year (e.g., September 23, 2023 or September 23rd, 2023)
          /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?[,\s]*\d{4}\b/i,
          // Abbreviated month with day and year (e.g., Sep 23, 2023 or Sep 23rd, 2023)
          /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?[,\s]*\d{4}\b/i,
          // YYYY-MM-DD
          /\b(20\d{2}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01]))\b/,
          // DD/MM/YYYY or DD-MM-YYYY
          /\b((0[1-9]|[12]\d|3[01])[-/](0[1-9]|1[0-2])[-/]20\d{2})\b/,
          // Just year
          /\b(20\d{2})\b/
        ];
        
        for (const pattern of datePatterns) {
          const match = text.match(pattern);
          if (match && match[0]) {
            try {
              // Clean up the date string by removing ordinal indicators and extra spaces
              const cleanDateStr = match[0]
                .replace(/(\d+)(st|nd|rd|th)/g, '$1')
                .replace(/\s+/g, ' ')
                .replace(/,/g, '')
                .trim();
                
              const date = new Date(cleanDateStr);
              if (!isNaN(date.getTime())) {
                extractedData.date = date.toISOString().slice(0, 16);
                console.log('Found date from pattern:', match[0], '->', extractedData.date);
                break;
              }
            } catch (e) {
              console.log('Date parsing error from pattern:', e);
            }
          }
        }
      }
      
      // If we still don't have a date, try to find and parse any date-like string
      if (!extractedData.date) {
        // Look for month names followed by a day number
        const monthDayPattern = /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?/i;
        const monthDayMatch = text.match(monthDayPattern);
        
        if (monthDayMatch) {
          try {
            // Add current year if no year is specified
            const currentYear = new Date().getFullYear();
            const dateStr = `${monthDayMatch[0]} ${currentYear}`.replace(/(\d+)(st|nd|rd|th)/g, '$1');
            const date = new Date(dateStr);
            
            if (!isNaN(date.getTime())) {
              extractedData.date = date.toISOString().slice(0, 16);
              console.log('Found month-day date:', monthDayMatch[0], '->', extractedData.date);
            }
          } catch (e) {
            console.log('Error parsing month-day date:', e);
          }
        }
      }
      
      // Try to find location using indicators first
      const locationFromIndicators = findValueAfterIndicators(text, locationIndicators);
      if (locationFromIndicators) {
        console.log('Found location from indicators:', locationFromIndicators);
        extractedData.location = locationFromIndicators;
      }
      
      // If no location found from indicators, try patterns and keywords
      if (!extractedData.location) {
        // Look for lines containing location keywords
        for (const line of lines) {
          const lowerLine = line.toLowerCase();
          
          // Check if line contains any location keyword
          const hasLocationKeyword = locationKeywords.some(keyword => 
            lowerLine.includes(keyword)
          );
          
          // Check if line looks like an address (contains numbers and street words)
          const looksLikeAddress = /\d+\s+[a-z\s]+(st|nd|rd|th|street|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr)\.?/i.test(line);
          
          if (hasLocationKeyword || looksLikeAddress) {
            extractedData.location = line.trim();
            console.log('Found location from keywords:', extractedData.location);
            break;
          }
        }
      }
      
      // Try to find category using indicators first
      const categoryFromIndicators = findValueAfterIndicators(text, categoryIndicators);
      if (categoryFromIndicators) {
        console.log('Found category from indicators:', categoryFromIndicators);
        extractedData.category = categoryFromIndicators;
      }
      
      // If no category found from indicators, try to find in text
      if (!extractedData.category) {
        const lowerText = text.toLowerCase();
        for (const category of commonCategories) {
          if (lowerText.includes(category)) {
            // Capitalize first letter
            extractedData.category = category.charAt(0).toUpperCase() + category.slice(1);
            console.log('Found category from text:', extractedData.category);
            break;
          }
        }
      }
      
      // Join remaining lines as description if not already set
      if (!extractedData.description && lines.length > 1) {
        extractedData.description = lines.slice(1).join('\n').trim();
        console.log('Set description from remaining text');
      }
      
      // Final check - if we found any data, update the form
      const foundAnyData = extractedData.title || extractedData.date || 
                         extractedData.location || extractedData.category;
      
      if (foundAnyData) {
        console.log('Updating form with extracted data:', extractedData);
        // Update the form state
        setFormData(prev => ({
          ...prev,
          ...extractedData
        }));
        showSuccess('Form updated with extracted information!');
      } else {
        console.log('No relevant information could be extracted from the image');
        showInfo('Could not extract event details. Please enter the information manually.');
      }
      
      // Update form data with extracted information
      setFormData(prev => ({
        ...prev,
        ...extractedData
      }));
      
      showSuccess('Text extracted from image!');
      return extractedData;
    } catch (error) {
      console.error('Error extracting text:', error);
      showError('Failed to extract text from image');
      return null;
    } finally {
      setIsExtractingText(false);
    }
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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/upload`, {
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
        
        // After successful upload, offer to extract text
        if (window.confirm('Would you like to extract text from this image to fill the form?')) {
          await extractTextFromImage(fullImageUrl);
        }
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
                    URL
                  </label>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://example.com"
                  />
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