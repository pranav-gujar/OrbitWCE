import React from 'react';
import { motion } from 'framer-motion';

const SuperAdminEvents = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Events Management</h1>
          <p className="text-xl text-gray-600">Manage all events from this centralized dashboard</p>
        </motion.div>

        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-6xl mb-6">👋</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome, SuperAdmin!</h2>
            <p className="text-gray-600 mb-6">
              This is your events management dashboard. Here you can view, create, and manage all events in the system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="text-3xl text-blue-500 mb-3">📅</div>
                <h3 className="font-medium text-gray-800 mb-2">View All Events</h3>
                <p className="text-sm text-gray-500">Browse through all scheduled events</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="text-3xl text-green-500 mb-3">➕</div>
                <h3 className="font-medium text-gray-800 mb-2">Create New Event</h3>
                <p className="text-sm text-gray-500">Add a new event to the platform</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="text-3xl text-purple-500 mb-3">📊</div>
                <h3 className="font-medium text-gray-800 mb-2">Event Analytics</h3>
                <p className="text-sm text-gray-500">View insights and statistics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminEvents;
