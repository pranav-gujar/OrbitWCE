import React, { useEffect, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import socket from '../../socket';
import { FaTrash, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';
import AuthContext from '../../AuthContext/AuthContext';
import { toast } from 'react-toastify';

const DeletionRequests = () => {
  const { user } = useContext(AuthContext);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch deletion requests on component mount
  useEffect(() => {
    fetchDeletionRequests();

    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }

    // Listen for new deletion requests
    socket.on('deletion_requested', (event) => {
      setDeletionRequests(prev => {
        // Check if this event is already in our list
        if (prev.some(e => e._id === event._id)) {
          return prev.map(e => e._id === event._id ? event : e);
        } else {
          return [event, ...prev];
        }
      });
      toast.info(`New deletion request received for event: ${event.title}`);
    });

    // Listen for resolved deletion requests
    socket.on('deletion_request_resolved', ({ eventId }) => {
      setDeletionRequests(prev => prev.filter(e => e._id !== eventId));
      toast.success(`Deletion request has been resolved`);
    });

    return () => {
      // Clean up event listeners
      socket.off('deletion_requested');
      socket.off('deletion_request_resolved');
    };
  }, []);

  const fetchDeletionRequests = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/deletion-requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setDeletionRequests(data.data || []);
      } else {
        toast.error(data.message || 'Failed to fetch deletion requests');
      }
    } catch (error) {
      console.error('Error fetching deletion requests:', error);
      toast.error('Failed to fetch deletion requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveDeletion = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${eventId}/approve-deletion`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Remove the event from the list
        setDeletionRequests(prev => prev.filter(e => e._id !== eventId));
        toast.success('Event deletion approved');
        setSelectedEvent(null);
        
        // Emit socket event to notify about approval
        if (socket.connected) {
          socket.emit('deletion_request_resolved', { eventId });
        }
      } else {
        toast.error(data.message || 'Failed to approve deletion');
      }
    } catch (error) {
      console.error('Error approving deletion:', error);
      toast.error('Failed to approve deletion');
    }
  };

  const handleRejectDeletion = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Update the event to remove the deletion request flag
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deletionRequested: false,
          deletionReason: ''
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Remove the event from the list
        setDeletionRequests(prev => prev.filter(e => e._id !== eventId));
        toast.info('Deletion request rejected');
        setSelectedEvent(null);
        
        // Emit socket event to notify about rejection
        if (socket.connected) {
          socket.emit('deletion_request_resolved', { eventId });
        }
      } else {
        toast.error(data.message || 'Failed to reject deletion request');
      }
    } catch (error) {
      console.error('Error rejecting deletion request:', error);
      toast.error('Failed to reject deletion request');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Event Deletion Requests</h1>
          <p className="text-xl text-gray-600">Review and manage deletion requests from community users</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : deletionRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Pending Deletion Requests</h2>
              <p className="text-gray-600 mb-6">
                There are currently no events pending deletion approval. Check back later or refresh the page.
              </p>
              <button 
                onClick={fetchDeletionRequests}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creator
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deletionRequests.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {event.imageUrl ? (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <img className="h-10 w-10 rounded-full object-cover" src={event.imageUrl} alt={event.title} />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 h-10 w-10 mr-3 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-500">📅</span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-500">{event.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {typeof event.creator === 'object' ? event.creator.name : 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {typeof event.creator === 'object' ? event.creator.email : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {event.deletionReason || 'No reason provided'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaInfoCircle className="inline mr-1" /> Details
                        </button>
                        <button
                          onClick={() => handleApproveDeletion(event._id)}
                          className="text-red-600 hover:text-red-900 mr-3"
                        >
                          <FaTrash className="inline mr-1" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectDeletion(event._id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <FaTimes className="inline mr-1" /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div 
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedEvent.title}</h2>
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                {selectedEvent.imageUrl && (
                  <img 
                    src={selectedEvent.imageUrl} 
                    alt={selectedEvent.title} 
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p className="text-gray-900">{selectedEvent.category}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date</h3>
                    <p className="text-gray-900">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="text-gray-900">{selectedEvent.location}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Creator</h3>
                    <p className="text-gray-900">
                      {typeof selectedEvent.creator === 'object' ? selectedEvent.creator.name : 'Unknown'}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="text-gray-900 whitespace-pre-line">{selectedEvent.description}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500">Deletion Reason</h3>
                  <p className="text-gray-900 whitespace-pre-line bg-red-50 p-3 rounded-md">
                    {selectedEvent.deletionReason || 'No reason provided'}
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleRejectDeletion(selectedEvent._id)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    <FaTimes className="inline mr-2" /> Reject Request
                  </button>
                  <button
                    onClick={() => handleApproveDeletion(selectedEvent._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <FaCheck className="inline mr-2" /> Approve Deletion
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeletionRequests;