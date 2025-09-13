import { motion } from 'framer-motion';
import socket from '../../socket';
import { useContext, useEffect, useState } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../AuthContext/AuthContext';
import CreateEvent from '../../Components/Event/CreateEvent';
import Event from '../../Components/Event/Event';
import { showError, showSuccess } from '../../utils/toast';

const Events = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // initial fetch
  useEffect(() => {
    fetchEvents();
  }, [user]);

  // listen for status updates of creator events
  useEffect(() => {
    // Check socket connection status
    console.log('🔌 Socket connection status on Events mount:', {
      connected: socket.connected,
      id: socket.id,
      disconnected: socket.disconnected
    });
    
    // Connect socket if not connected
    if (!socket.connected) {
      console.log('🔄 Attempting to connect socket from Events component...');
      socket.connect();
    }
    
    // Listen for status updates
    const handleStatusUpdate = (updatedEvent) => {
      console.log('🔄 Status updated for event:', updatedEvent._id);
      setEvents(prev => prev.map(ev => ev._id === updatedEvent._id ? updatedEvent : ev));
    };

    // Listen for event creation or update
    const handleEventCreated = (newEvent) => {
      console.log('➕ New event created or updated:', newEvent._id);
      
      // Check if this event already exists in our state (update case)
      setEvents(prev => {
        const eventExists = prev.some(ev => ev._id === newEvent._id);
        
        if (eventExists) {
          // Update existing event
          console.log('🔄 Updating existing event:', newEvent._id);
          return prev.map(ev => ev._id === newEvent._id ? newEvent : ev);
        } else {
          // Add new event based on user role
          if (user?.role === 'community') {
            const creatorId = typeof newEvent.creator === 'object' ? newEvent.creator._id : newEvent.creator;
            if (creatorId === user._id) {
              console.log('➕ Adding new event created by current user');
              return [newEvent, ...prev];
            }
          } 
          
          // For regular users, only show approved events
          if (newEvent.status === 'approved' || user?.role === 'admin' || user?.role === 'superadmin') {
            console.log('➕ Adding new event with approved status or for admin user');
            return [newEvent, ...prev];
          }
          
          return prev;
        }
      });
    };

    // Listen for event deletion
    const handleEventDeleted = (deletedEventId) => {
      console.log('🗑️ Event deletion notification received:', deletedEventId);
      
      // Ensure we're working with a string ID
      const eventIdToDelete = typeof deletedEventId === 'string' ? deletedEventId : 
                            (deletedEventId._id || deletedEventId).toString();
      
      setEvents(prev => {
        // Log before filtering to help with debugging
        console.log('Current events before filtering:', prev.map(e => ({ id: e._id, title: e.title })));
        
        const updated = prev.filter(ev => {
          const eventId = typeof ev._id === 'string' ? ev._id : 
                        (ev._id?.toString() || ev._id);
          
          const matches = eventId !== eventIdToDelete;
          if (!matches) {
            console.log(`Removing event with ID: ${eventId}`);
          }
          return matches;
        });
        
        if (updated.length === prev.length) {
          console.warn('[Events] Event not found in current list, no changes made. Looking for ID:', eventIdToDelete);
        } else {
          console.log(`✅ Successfully removed event. Events count: ${prev.length} → ${updated.length}`);
          showSuccess('Event has been deleted');
        }
        
        return updated;
      });
    };
    
    // Register event listeners
    socket.on('event_status_updated', handleStatusUpdate);
    socket.on('event_created', handleEventCreated);
    socket.on('event_deleted', handleEventDeleted);
    
    console.log('✅ Event listeners registered');

    // Cleanup function to remove event listeners
    return () => {
      socket.off('event_status_updated', handleStatusUpdate);
      socket.off('event_created', handleEventCreated);
      socket.off('event_deleted', handleEventDeleted);
      console.log('🧹 Cleaned up event listeners');
    };
  }, [user]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      
      let url = `${import.meta.env.VITE_API_URL}/api/events`;
      let likedEvents = [];
      let registeredEvents = [];
      let headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if user is logged in
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        
        // Fetch user's liked events if logged in
        try {
          const likedResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/events/user/liked`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (likedResponse.ok) {
            const likedData = await likedResponse.json();
            likedEvents = likedData.data || [];
          }
          
          // Fetch events the user is registered for
          if (user && user.email) {
            const eventsResponse = await fetch(url, { method: 'GET', headers });
            const eventsData = await eventsResponse.json();
            
            if (eventsResponse.ok) {
              const allEvents = eventsData.data || [];
              // Check each event's registrations for the user's email
              registeredEvents = allEvents.filter(event => 
                event.registrations && 
                event.registrations.some(reg => reg.email === user.email)
              ).map(event => event._id);
            }
          }
        } catch (error) {
          console.error('Error fetching liked or registered events:', error);
          // Continue with main events fetch even if liked events fetch fails
        }
      }

      // For community users, fetch their own events separately and merge with approved events
      if (user?.role === 'community') {
        // Fetch approved events
        const approvedResponse = await fetch(url, { method: 'GET', headers });
        const approvedData = await approvedResponse.json();
        
        // Fetch user's own events
        const myEventsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/events/user/my-events`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const myEventsData = await myEventsResponse.json();
        
        if (approvedResponse.ok && myEventsResponse.ok) {
          const approvedEvents = approvedData.data || [];
          const myEvents = myEventsData.data || [];
          
          // Merge events and remove duplicates (prioritize user's events)
          const allEvents = [...myEvents];
          approvedEvents.forEach(event => {
            if (!allEvents.some(e => e._id === event._id)) {
              allEvents.push(event);
            }
          });
          
          // Mark events as liked and registered if they are in the user's liked/registered events
          const eventsWithStatus = allEvents.map(event => ({
            ...event,
            isLiked: likedEvents.some(likedEvent => likedEvent._id === event._id),
            isRegistered: registeredEvents.includes(event._id)
          }));
          
          setEvents(eventsWithStatus);
        } else {
          showError('Failed to fetch events');
        }
      } else {
        // For other roles, use the standard endpoint
        const response = await fetch(url, { method: 'GET', headers });
        const data = await response.json();

        if (response.ok) {
          const eventsArray = data.data || [];
          
          // Filter events based on user role
          let filteredEvents;
          
          if (user?.role === 'user') {
            // Regular users only see approved events
            filteredEvents = eventsArray.filter(event => event.status === 'approved');
          } else {
            // Admin/superadmin see all events
            filteredEvents = eventsArray;
          }
          
          // Mark events as liked and registered if they are in the user's liked/registered events
          const eventsWithStatus = filteredEvents.map(event => ({
            ...event,
            isLiked: likedEvents.some(likedEvent => likedEvent._id === event._id),
            isRegistered: registeredEvents.includes(event._id)
          }));
          
          setEvents(eventsWithStatus);
        } else {
          showError(data.message || 'Failed to fetch events');
        }
      }
    } catch (error) {
      console.error('Fetch events error:', error);
      showError('An error occurred while fetching events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (eventId, isLiked) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        showError('You must be logged in to like events');
        return;
      }

      // Determine the endpoint based on whether we're liking or unliking
      const endpoint = isLiked ? 'like' : 'unlike';
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${eventId}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Update UI
        setEvents(events.map(event => 
          (event.id === eventId || event._id === eventId) ? 
            { ...event, isLiked, attendees: isLiked ? (event.attendees || 0) + 1 : (event.attendees || 1) - 1 } : 
            event
        ));
      } else {
        showError(data.message || `Failed to ${isLiked ? 'like' : 'unlike'} event`);
      }
    } catch (error) {
      console.error(`Error ${isLiked ? 'liking' : 'unliking'} event:`, error);
      showError(`An error occurred while ${isLiked ? 'liking' : 'unliking'} the event`);
    }
  };

  const handleRegister = async (eventId) => {
    // Navigate to the event detail page
    navigate(`/events/${eventId}`);
  };
  
  const handleEventCreated = (newEvent) => {
    console.log('Event created/updated via form submission:', newEvent._id);
    // Don't add to events array here to prevent duplication
    // The socket event will handle adding the event to the state
    setShowCreateForm(false);
    setEditingEvent(null);
    
    // Refresh events from the server to ensure consistency
    fetchEvents();
  };
  
  const handleEditEvent = (eventId) => {
    console.log('Edit event triggered with ID:', eventId);
    const eventToEdit = events.find(event => event._id === eventId || event.id === eventId);
    console.log('Found event to edit:', eventToEdit);
    if (eventToEdit) {
      setEditingEvent(eventToEdit);
      setShowCreateForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredEvents = events.filter(event => {
    if (!event || !event.title || !event.description) return false;
    
    // Search filter
    const matchesSearch = searchTerm === '' || 
      (event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Date-based filter
    const now = new Date();
    const eventDate = new Date(event.date);
    
    let matchesFilter = true;
    switch (activeFilter) {
      case 'upcoming':
        matchesFilter = eventDate > now;
        break;
      case 'past':
        matchesFilter = eventDate < now;
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-gray-100 ">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4">Upcoming Events</h1>
          <p className="text-xl text-gray-400">Discover and join exciting events in our community</p>
          
          {user?.role === 'community' && (
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="mt-6 inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
            >
              <FaPlus className="mr-2" />
              {showCreateForm ? 'Hide Form' : 'Create New Event'}
            </button>
          )}
        </motion.div>
        
        {/* Event Creation/Edit Form for Community Users */}
        {user?.role === 'community' && showCreateForm && (
          <div className="mb-12">
            <CreateEvent 
              onEventCreated={handleEventCreated} 
              editingEvent={editingEvent}
            />
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className={`px-4 py-2 rounded-lg ${activeFilter === 'all' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300'}`}
              onClick={() => setActiveFilter('all')}
            >
              All Events
            </button>
            <button 
              className={`px-4 py-2 rounded-lg ${activeFilter === 'upcoming' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300'}`}
              onClick={() => setActiveFilter('upcoming')}
            >
              Upcoming
            </button>
            <button 
              className={`px-4 py-2 rounded-lg ${activeFilter === 'past' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300'}`}
              onClick={() => setActiveFilter('past')}
            >
              Past Events
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => {
              // Use a default image if imageUrl is not available or invalid
              const imageUrl = event.imageUrl || 'https://images.unsplash.com/photo-1505373877841-8d25f96d5538?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';
              
              return (
                <motion.div
                  key={event._id || event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Event
                    id={event._id || event.id}
                    title={event.title}
                    date={event.date}
                    description={event.description}
                    imageUrl={imageUrl}
                    attendees={event.attendees || 0}
                    isLiked={event.isLiked || false}
                    isRegistered={event.isRegistered || false}
                    category={event.category}
                    status={event.status}
                    creator={event.creator}
                    onRegister={handleRegister}
                    onLike={handleLike}
                    onEdit={handleEditEvent}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No events found. Try adjusting your search or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
