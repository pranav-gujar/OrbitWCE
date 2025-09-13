import React, { useState, useEffect, useContext } from 'react';
import socket from '../../socket';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import AuthContext from '../../AuthContext/AuthContext';
import { showSuccess, showError } from '../../utils/toast';

const Permissions = () => {
  const { handleSubmit } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  // initial fetch
  useEffect(() => {
    fetchEvents();
  }, []);

  // socket listeners
  useEffect(() => {
    socket.on('event_created', (newEvent) => {
      setEvents(prev => [newEvent, ...prev]);
    });

    socket.on('event_status_updated', (updatedEvent) => {
      setEvents(prev => prev.map(ev => ev._id === updatedEvent._id ? updatedEvent : ev));
    });

    return () => {
      socket.off('event_created');
      socket.off('event_status_updated');
    };
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setEvents(Array.isArray(data) ? data : data.data || []);
      } else {
        showError(data.message || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Fetch events error:', error);
      showError('An error occurred while fetching events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (eventId, status, rejectionReason = '') => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${eventId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, rejectionReason })
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess(`Event ${status} successfully`);
        // Update local state
        setEvents(events.map(event => 
          event._id === eventId ? { ...event, status } : event
        ));
      } else {
        showError(data.message || `Failed to ${status} event`);
      }
    } catch (error) {
      console.error(`Update event status error:`, error);
      showError(`An error occurred while updating event status`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (activeTab === 'all') return true;
    return event.status === activeTab;
  });
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Event Permissions</h1>
          <p className="text-xl text-gray-600">Approve or reject events created by community users</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-md ${activeTab === 'pending' ? 'bg-white shadow-md text-red-600' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 rounded-md ${activeTab === 'approved' ? 'bg-white shadow-md text-green-600' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              Approved
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 rounded-md ${activeTab === 'rejected' ? 'bg-white shadow-md text-red-600' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              Rejected
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-md ${activeTab === 'all' ? 'bg-white shadow-md text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              All Events
            </button>
          </div>
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <FaCalendarAlt className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No {activeTab !== 'all' ? activeTab : ''} events found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creator
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={event.imageUrl || 'https://via.placeholder.com/150?text=Event'} 
                              alt={event.title} 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{event.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(event.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{event.creator?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{event.creator?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.status === 'approved' ? 'bg-green-100 text-green-800' : event.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {event.status === 'pending' && (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleUpdateStatus(event._id, 'approved')}
                              className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 p-2 rounded-full"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Please enter rejection reason:');
                                if (reason !== null) {
                                  handleUpdateStatus(event._id, 'rejected', reason);
                                }
                              }}
                              className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-2 rounded-full"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        )}
                        {event.status === 'approved' && (
                          <button
                            onClick={() => {
                              const reason = prompt('Please enter rejection reason:');
                              if (reason !== null) {
                                handleUpdateStatus(event._id, 'rejected', reason);
                              }
                            }}
                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-2 rounded-full"
                          >
                            <FaTimes />
                          </button>
                        )}
                        {event.status === 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(event._id, 'approved')}
                            className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 p-2 rounded-full"
                          >
                            <FaCheck />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Permissions;
