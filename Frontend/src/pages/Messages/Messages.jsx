import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaBell, FaInfoCircle } from 'react-icons/fa';
import { showError, showSuccess } from '../../utils/toast';

const Messages = () => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      showError('Please enter a message');
      return;
    }
    try {
      setIsSending(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message, type: 'broadcast' })
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess('Message sent to all users');
        setMessage('');
      } else {
        showError(data.message || 'Failed to send message');
      }
    } catch (err) {
      showError('An error occurred while sending message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="p-3 bg-white/10 rounded-full"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    repeatType: "reverse" 
                  }}
                >
                  <FaBell className="w-6 h-6 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold text-white">Broadcast Message</h1>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                <FaInfoCircle className="text-white/80" />
                <span className="text-sm text-white/90">Admin Panel</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <motion.div 
              className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-xl mb-6 border-l-4 border-indigo-500"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-start">
                <FaInfoCircle className="flex-shrink-0 mt-1 mr-3 text-indigo-400" />
                <p className="text-sm text-gray-300">
                  Example: <span className="text-white font-medium">"Recruitment for Assistant Board in Community 4 is now open. Apply now!"</span>
                </p>
              </div>
            </motion.div>

            <form onSubmit={handleSend}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Message
                </label>
                <div className="relative">
                  <textarea
                    className="w-full h-40 p-4 text-gray-200 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Type your broadcast message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ backdropFilter: 'blur(4px)' }}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center">
                    <span className={`text-xs mr-2 ${message.length > 0 ? 'text-indigo-300' : 'text-gray-500'}`}>
                      {message.length}/500
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-end"
              >
                <button
                  type="submit"
                  disabled={isSending || !message.trim()}
                  className={`relative overflow-hidden group flex items-center px-6 py-3 rounded-lg font-medium text-white ${
                    isSending || !message.trim() 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-indigo-500/20'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isSending ? (
                      <motion.span
                        key="sending"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center"
                      >
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="send"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center"
                      >
                        <FaPaperPlane className="mr-2" />
                        Broadcast Message
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  <span className={`absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                    isSending || !message.trim() ? 'hidden' : ''
                  }`}></span>
                </button>
              </motion.div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Messages;


