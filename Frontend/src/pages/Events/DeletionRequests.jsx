import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import { motion } from 'framer-motion';
import { showError, showSuccess } from '../../utils/toast';

const DeletionRequests = () => {
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // initial fetch
  useEffect(() => {
    fetchDeletionRequests();
  }, []);

  // socket listeners for real-time updates
  useEffect(() => {
    console.log('🔌 Setting up socket listeners...');
    
    // when a deletion is requested
    const handleNewRequest = (event) => {
      console.log('📥 Received deletion_requested event:', event);
      setDeletionRequests(prev => {
        console.log('Current requests before update:', prev);
        return [event, ...prev];
      });
    };

    // when a request is resolved (approved or rejected)
    const handleRequestResolved = ({ eventId }) => {
      console.log('📥 Received deletion_request_resolved for event:', eventId);
      setDeletionRequests(prev => {
        const updated = prev.filter(ev => ev._id !== eventId);
        console.log('Updated requests after resolution:', updated);
        return updated;
      });
    };

    // Register event listeners
    socket.on('deletion_requested', handleNewRequest);
    socket.on('deletion_request_resolved', handleRequestResolved);

    // Log all socket events for debugging
    const logEvent = (event, ...args) => {
      console.log(`📡 Socket event '${event}' received:`, args[0] || 'No data');
    };
    
    socket.onAny(logEvent);

    return () => {
      console.log('🧹 Cleaning up socket listeners');
      socket.off('deletion_requested', handleNewRequest);
      socket.off('deletion_request_resolved', handleRequestResolved);
      socket.offAny(logEvent);
    };
  }, []);

  const fetchDeletionRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/deletion-requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Backend responds with { success, count, data }
        setDeletionRequests(data.data || data.events || []);
      } else {
        showError(data.message || 'Failed to fetch deletion requests');
      }
    } catch (error) {
      console.error('Error fetching deletion requests:', error);
      showError('An error occurred while fetching deletion requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (eventId, approved) => {
    try {
      console.log(`Processing ${approved ? 'approval' : 'rejection'} for event:`, eventId);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${eventId}/approve-deletion`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ approved })
      });

      const data = await response.json();
      console.log('Deletion approval response:', data);

      if (response.ok) {
        const message = approved ? 'Deletion request approved' : 'Deletion request rejected';
        console.log(message);
        showSuccess(message);
        
        // Remove the event from the list immediately for better UX
        setDeletionRequests(prev => {
          const updated = prev.filter(event => event._id !== eventId);
          console.log(`Updated deletion requests list. Remaining: ${updated.length}`);
          return updated;
        });
        
        // If approved, let the backend handle the socket emission
        // The backend will emit 'event_deleted' which is handled by the Events component
      } else {
        const errorMsg = data.message || 'Failed to process deletion request';
        console.error('Deletion approval error:', errorMsg);
        showError(errorMsg);
      }
    } catch (error) {
      console.error('Error processing deletion request:', error);
      showError('An error occurred while processing the deletion request');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">Event Deletion Requests</h1>
          <p className="text-xl text-gray-300">Review and manage event deletion requests</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : deletionRequests.length === 0 ? (
          <div className="bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-2xl font-semibold text-white mb-4">No Pending Deletion Requests</h2>
              <p className="text-gray-300 mb-6">
                There are currently no events pending deletion approval.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {deletionRequests.map(event => (
              <motion.div 
                key={event._id}
                className="bg-gray-800 rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
                      <p className="text-gray-300 mb-4">
                        <span className="font-medium">Created by:</span> {event.creator.name || 'Unknown'}
                      </p>
                    </div>
                    <div className="bg-red-900 bg-opacity-30 px-3 py-1 rounded-full text-red-300 text-sm font-medium">
                      Deletion Requested
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-lg font-medium text-white mb-2">Event Details</h4>
                    <p className="text-gray-300 mb-2">{event.description}</p>
                    <p className="text-gray-400 mb-4">
                      <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <h4 className="text-lg font-medium text-white mb-2">Deletion Reason</h4>
                    <p className="text-gray-300 mb-4">{event.deletionReason || 'No reason provided'}</p>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      onClick={() => handleApproval(event._id, false)}
                    >
                      Reject Deletion
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      onClick={() => handleApproval(event._id, true)}
                    >
                      Approve Deletion
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeletionRequests;