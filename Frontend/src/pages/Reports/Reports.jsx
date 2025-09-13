import { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaEdit, FaFileAlt, FaImage, FaPaperPlane, FaTrash, FaSpinner, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../AuthContext/AuthContext';
import { showError, showSuccess } from '../../utils/toast';

const Reports = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [completedEvents, setCompletedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportData, setReportData] = useState({
        highlights: '',
        feedback: '',
        photos: [],
        isSubmitted: false,
        reportId: null
    });
    
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 15
            }
        }
    };

    // Fetch events created by the community user
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    showError('Authentication required');
                    navigate('/login');
                    return;
                }

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/user/my-events`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch events');
                }

                // Separate completed and ongoing events
                const completed = data.data.filter(event => event.status === 'completed');
                const ongoing = data.data.filter(event => event.status !== 'completed');
                
                setCompletedEvents(completed);
                setEvents(ongoing);
            } catch (error) {
                console.error('Error fetching events:', error);
                showError(error.message || 'Failed to fetch events');
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'community') {
            fetchEvents();
        } else {
            navigate('/');
        }
    }, [user, navigate]);

    // Mark event as completed
    const handleMarkAsCompleted = async (eventId) => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                showError('Authentication required');
                navigate('/login');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'completed' })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update event status');
            }

            // Move event from events to completedEvents
            const updatedEvent = events.find(event => event._id === eventId);
            if (updatedEvent) {
                updatedEvent.status = 'completed';
                setEvents(events.filter(event => event._id !== eventId));
                setCompletedEvents([...completedEvents, updatedEvent]);
                showSuccess('Event marked as completed');
                
                // Auto-generate report
                setSelectedEvent(updatedEvent);
                generateReport(updatedEvent);
            }
        } catch (error) {
            console.error('Error updating event status:', error);
            showError(error.message || 'Failed to update event status');
        }
    };

    // Generate report for an event
    const generateReport = async (event) => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                showError('Authentication required');
                navigate('/login');
                return;
            }

            // Create or get report for this event
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/event/${event._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to generate report');
            }

            // Set report data with event details
            setReportData({
                highlights: data.data.highlights || `${event.title} was successfully held on ${new Date(event.date).toLocaleDateString()}. `,
                feedback: data.data.feedback || 'Participants enjoyed the event and provided positive feedback.',
                photos: data.data.photos || [],
                isSubmitted: data.data.isSubmitted || false,
                reportId: data.data._id // Store the report ID
            });
        } catch (error) {
            console.error('Error generating report:', error);
            showError(error.message || 'Failed to generate report');
        }
    };

    // Handle report data changes
    const handleReportChange = (e) => {
        const { name, value } = e.target;
        setReportData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle photo upload
    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        const newPhotos = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        }));

        setReportData(prev => ({
            ...prev,
            photos: [...prev.photos, ...newPhotos]
        }));
    };

    // Remove photo
    const handleRemovePhoto = (index) => {
        const updatedPhotos = [...reportData.photos];
        URL.revokeObjectURL(updatedPhotos[index].preview);
        updatedPhotos.splice(index, 1);
        
        setReportData(prev => ({
            ...prev,
            photos: updatedPhotos
        }));
    };

    // Submit report to superadmin
    const handleSubmitReport = async () => {
        try {
            if (!selectedEvent) {
                showError('No event selected');
                return;
            }

            const token = localStorage.getItem('token');
            
            if (!token) {
                showError('Authentication required');
                navigate('/login');
                return;
            }

            // Check if we have a report ID
            if (!reportData.reportId) {
                throw new Error('Report ID not found. Please try viewing the report again.');
            }

            // First update the report with the current data
            const updateResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/${reportData.reportId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    highlights: reportData.highlights,
                    feedback: reportData.feedback
                })
            });

            const updateData = await updateResponse.json();
            
            if (!updateResponse.ok) {
                throw new Error(updateData.message || 'Failed to update report');
            }

            // Then submit the report
            const submitResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/${reportData.reportId}/submit`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const submitData = await submitResponse.json();
            
            if (!submitResponse.ok) {
                throw new Error(submitData.message || 'Failed to submit report');
            }

            setReportData(prev => ({
                ...prev,
                isSubmitted: true
            }));
            showSuccess('Report submitted to superadmin');
        } catch (error) {
            console.error('Error submitting report:', error);
            showError(error.message || 'Failed to submit report');
        }
    };

    // View event details and report
    const handleViewReport = (event) => {
        setSelectedEvent(event);
        // Check if report exists or generate a new one
        generateReport(event);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Ongoing Events Card */}
                            <motion.div 
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                                    <h2 className="text-lg font-semibold text-white flex items-center">
                                        <FaCalendarAlt className="mr-2" />
                                        Ongoing Events
                                    </h2>
                                </div>
                                <div className="p-4">
                                    {events.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No ongoing events</p>
                                    ) : (
                                        <motion.ul className="space-y-3">
                                            {events.map((event, index) => (
                                                <motion.li 
                                                    key={event._id} 
                                                    className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition-shadow"
                                                    variants={itemVariants}
                                                    whileHover={{ x: 5 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-medium text-gray-800">{event.title}</h3>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {new Date(event.date).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </p>
                                                        </div>
                                                        <motion.button
                                                            onClick={() => handleMarkAsCompleted(event._id)}
                                                            className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center hover:bg-green-200 transition-colors"
                                                            whileHover={{ scale: 1.03 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <FaCheckCircle className="mr-1" />
                                                            Complete
                                                        </motion.button>
                                                    </div>
                                                </motion.li>
                                            ))}
                                        </motion.ul>
                                    )}
                                </div>
                            </motion.div>

                            {/* Completed Events Card */}
                            <motion.div 
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                                    <h2 className="text-lg font-semibold text-white flex items-center">
                                        <FaCheckCircle className="mr-2" />
                                        Completed Events
                                    </h2>
                                </div>
                                <div className="p-4">
                                    {completedEvents.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No completed events</p>
                                    ) : (
                                        <motion.ul className="space-y-3">
                                            {completedEvents.map((event, index) => (
                                                <motion.li 
                                                    key={event._id} 
                                                    className={`group bg-gray-50 rounded-lg p-3 hover:shadow-md transition-all ${selectedEvent?._id === event._id ? 'ring-2 ring-indigo-500' : ''}`}
                                                    variants={itemVariants}
                                                    whileHover={{ x: 5 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-medium text-gray-800">{event.title}</h3>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {new Date(event.date).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </p>
                                                        </div>
                                                        <motion.button
                                                            onClick={() => handleViewReport(event)}
                                                            className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center hover:bg-indigo-200 transition-colors"
                                                            whileHover={{ scale: 1.03 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <FaFileAlt className="mr-1" />
                                                            {reportData.reportId && reportData.isSubmitted ? 'View' : 'Report'}
                                                        </motion.button>
                                                    </div>
                                                </motion.li>
                                            ))}
                                        </motion.ul>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Content Area */}
                        <div className="lg:col-span-2">
                            <AnimatePresence mode="wait">
                                {selectedEvent ? (
                                    <motion.div 
                                        key="report-form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full"
                                    >
                                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                                            <div className="flex items-center">
                                                <button 
                                                    onClick={() => setSelectedEvent(null)}
                                                    className="mr-3 text-white hover:bg-white/20 p-1 rounded-full"
                                                >
                                                    <FaArrowLeft />
                                                </button>
                                                <h2 className="text-xl font-semibold text-white">
                                                    {selectedEvent.title} Report
                                                </h2>
                                                {reportData.isSubmitted && (
                                                    <span className="ml-auto bg-white/20 text-white text-xs px-3 py-1 rounded-full flex items-center">
                                                        <FaCheckCircle className="mr-1" /> Submitted
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-indigo-100 mt-1">
                                                {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        
                                        <div className="p-6">
                                            <motion.div className="space-y-6">
                                                {/* Highlights Section */}
                                                <motion.div 
                                                    className="space-y-2"
                                                    variants={itemVariants}
                                                >
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Event Highlights
                                                    </label>
                                                    <div className="mt-1 relative">
                                                        <textarea
                                                            name="highlights"
                                                            value={reportData.highlights}
                                                            onChange={handleReportChange}
                                                            className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                                                            rows="4"
                                                            placeholder="Share the key highlights and achievements of this event..."
                                                            disabled={reportData.isSubmitted}
                                                        />
                                                        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                                            {reportData.highlights.length}/1000
                                                        </div>
                                                    </div>
                                                </motion.div>

                                                {/* Feedback Section */}
                                                <motion.div 
                                                    className="space-y-2"
                                                    variants={itemVariants}
                                                >
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Participant Feedback
                                                    </label>
                                                    <div className="mt-1 relative">
                                                        <textarea
                                                            name="feedback"
                                                            value={reportData.feedback}
                                                            onChange={handleReportChange}
                                                            className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                                                            rows="4"
                                                            placeholder="Share feedback received from participants..."
                                                            disabled={reportData.isSubmitted}
                                                        />
                                                        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                                            {reportData.feedback.length}/1000
                                                        </div>
                                                    </div>
                                                </motion.div>

                                                {/* Photo Gallery */}
                                                <motion.div 
                                                    className="space-y-2"
                                                    variants={itemVariants}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Event Photos
                                                        </label>
                                                        <span className="text-xs text-gray-500">
                                                            {reportData.photos.length} {reportData.photos.length === 1 ? 'photo' : 'photos'} uploaded
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="mt-2">
                                                        {reportData.photos.length > 0 ? (
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                                {reportData.photos.map((photo, index) => (
                                                                    <motion.div 
                                                                        key={index} 
                                                                        className="relative group rounded-lg overflow-hidden aspect-square"
                                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                                        transition={{ duration: 0.2 }}
                                                                    >
                                                                        <img 
                                                                            src={photo.preview} 
                                                                            alt={`Event photo ${index + 1}`} 
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                        {!reportData.isSubmitted && (
                                                                            <motion.button
                                                                                type="button"
                                                                                onClick={() => handleRemovePhoto(index)}
                                                                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                whileHover={{ scale: 1.1 }}
                                                                                whileTap={{ scale: 0.9 }}
                                                                            >
                                                                                <FaTrash size={12} />
                                                                            </motion.button>
                                                                        )}
                                                                    </motion.div>
                                                                ))}
                                                                {!reportData.isSubmitted && (
                                                                    <motion.label 
                                                                        className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors aspect-square"
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                    >
                                                                        <FaImage className="text-gray-400 mb-2" size={24} />
                                                                        <span className="text-sm text-gray-500">Add Photo</span>
                                                                        <input 
                                                                            type="file" 
                                                                            accept="image/*" 
                                                                            multiple 
                                                                            onChange={handlePhotoUpload} 
                                                                            className="hidden" 
                                                                            disabled={reportData.isSubmitted}
                                                                        />
                                                                    </motion.label>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <motion.label 
                                                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                                                whileHover={{ scale: 1.01 }}
                                                                whileTap={{ scale: 0.99 }}
                                                            >
                                                                <FaImage className="text-gray-400 mb-3" size={32} />
                                                                <p className="text-sm text-gray-500 text-center mb-2">
                                                                    Drag & drop photos here, or click to browse
                                                                </p>
                                                                <span className="text-xs text-gray-400">
                                                                    Supports JPG, PNG up to 5MB
                                                                </span>
                                                                <input 
                                                                    type="file" 
                                                                    accept="image/*" 
                                                                    multiple 
                                                                    onChange={handlePhotoUpload} 
                                                                    className="hidden" 
                                                                    disabled={reportData.isSubmitted}
                                                                />
                                                            </motion.label>
                                                        )}
                                                    </div>
                                                </motion.div>

                                                {/* Action Buttons */}
                                                <motion.div 
                                                    className="pt-4 flex justify-end space-x-3"
                                                    variants={itemVariants}
                                                >
                                                    <motion.button
                                                        type="button"
                                                        onClick={() => setSelectedEvent(null)}
                                                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        Back to List
                                                    </motion.button>
                                                    
                                                    <motion.button
                                                        type="button"
                                                        onClick={handleSubmitReport}
                                                        disabled={reportData.isSubmitted || isSubmitting}
                                                        className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all flex items-center ${
                                                            reportData.isSubmitted 
                                                                ? 'bg-green-500 cursor-not-allowed' 
                                                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                                                        }`}
                                                        whileHover={{ 
                                                            scale: reportData.isSubmitted || isSubmitting ? 1 : 1.03,
                                                            y: reportData.isSubmitted || isSubmitting ? 0 : -2
                                                        }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <FaSpinner className="animate-spin mr-2" />
                                                                Submitting...
                                                            </>
                                                        ) : reportData.isSubmitted ? (
                                                            <>
                                                                <FaCheckCircle className="mr-2" />
                                                                Submitted
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaPaperPlane className="mr-2" />
                                                                Submit Report
                                                            </>
                                                        )}
                                                    </motion.button>
                                                </motion.div>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="empty-state"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center h-full min-h-[400px] text-center"
                                    >
                                        <div className="bg-indigo-100 p-4 rounded-full mb-4">
                                            <FaFileAlt className="w-10 h-10 text-indigo-600" />
                                        </div>
                                        <h3 className="text-xl font-medium text-gray-800 mb-2">No Report Selected</h3>
                                        <p className="text-gray-500 max-w-md mb-6">
                                            Select a completed event to view or edit its report, or mark an event as completed to get started.
                                        </p>
                                        <div className="flex space-x-3">
                                            <motion.button
                                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center"
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <FaArrowLeft className="mr-2" />
                                                View Events
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;