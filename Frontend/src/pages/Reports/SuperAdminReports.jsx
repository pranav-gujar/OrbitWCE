import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartBar, FaFileExport, FaSearch, FaUsers, FaDownload, FaEye, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import socket from '../../socket';

const SuperAdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, ongoing, upcoming, completed
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reviewComments, setReviewComments] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchReports();
    
    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }
    
    // Listen for new reports
    socket.on('new_report_submitted', (newReport) => {
      console.log('New report submitted:', newReport);
      setReports(prevReports => [newReport, ...prevReports]);
      toast.info(`New report submitted for event: ${newReport.eventDetails?.title || 'Unknown Event'}`);
    });
    
    // Listen for report updates
    socket.on('report_updated', (updatedReport) => {
      console.log('Report updated:', updatedReport);
      setReports(prevReports => 
        prevReports.map(report => 
          report._id === updatedReport._id ? updatedReport : report
        )
      );
    });
    
    // Cleanup listeners on unmount
    return () => {
      socket.off('new_report_submitted');
      socket.off('report_updated');
    };
  }, []);
  
  // Update statistics when reports change
  useEffect(() => {
    // Calculate event counts for statistics
    const today = new Date();
    const upcoming = reports.filter(report => new Date(report.eventDetails.date) > today).length;
    const ongoing = reports.filter(report => new Date(report.eventDetails.date).toDateString() === today.toDateString()).length;
    const completed = reports.filter(report => new Date(report.eventDetails.date) < today).length;
    
    // Fetch additional statistics if needed
    fetchEventCounts();
  }, [reports]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/reports/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        setReports(response.data.data);
      } else {
        setReports([]);
        setError('No reports data received from server');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      // More detailed error handling
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch reports. Please try again.';
      
      setError(errorMessage);
      toast.error('Failed to fetch reports: ' + errorMessage);
      setReports([]); // Ensure reports is empty on error
      setLoading(false);
    }
  };
  
  // Fetch event counts for the statistics
    const fetchEventCounts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/events/counts`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Update the statistics with actual counts
            setStatistics([
                { title: 'All Reports', count: reports.length, color: 'bg-blue-500' },
                { title: 'Upcoming Events', count: response.data.upcoming || 0, color: 'bg-purple-500' },
                { title: 'Ongoing Events', count: response.data.ongoing || 0, color: 'bg-green-500' },
                { title: 'Completed Events', count: response.data.completed || 0, color: 'bg-yellow-500' }
            ]);
        } catch (err) {
            console.error('Error fetching event counts:', err);
        }
    };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setReviewComments(report.reviewComments || '');
    setShowReportModal(true);
  };

  const handleReviewReport = async (reportId) => {
    try {
      setReviewLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/reports/${reportId}/review`, 
        { reviewComments },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the report in the local state
      setReports(prevReports => 
        prevReports.map(report => 
          report._id === reportId 
            ? { 
                ...report, 
                status: 'reviewed', 
                reviewComments,
                reviewedAt: new Date().toISOString() 
              } 
            : report
        )
      );
      
      // Update the selected report
      setSelectedReport(prev => ({
        ...prev,
        status: 'reviewed',
        reviewComments,
        reviewedAt: new Date().toISOString()
      }));
      
      toast.success('Report reviewed successfully');
      
      // Socket will automatically notify other users about this update
      // The server will emit 'report_updated' event to all connected clients
    } catch (error) {
      console.error('Error reviewing report:', error);
      toast.error('Failed to review report');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDownloadReport = (report) => {
    // Create a formatted report text
    const reportText = `
      EVENT REPORT
      
      Title: ${report.eventDetails.title}
      Date: ${new Date(report.eventDetails.date).toLocaleDateString()}
      Location: ${report.eventDetails.location}
      Category: ${report.eventDetails.category}
      
      STATISTICS
      Total Registered: ${report.participantData.totalRegistered}
      Total Attended: ${report.participantData.totalAttended}
      
      HIGHLIGHTS
      ${report.highlights}
      
      FEEDBACK
      ${report.feedback}
      
      NOTES
      ${report.notes || 'No additional notes'}
      
      Report Status: ${report.status}
      Created by: ${report.creator?.name || 'Unknown'}
      Submitted on: ${report.submittedAt ? new Date(report.submittedAt).toLocaleString() : 'Not submitted'}
      ${report.status === 'reviewed' ? `
      REVIEW COMMENTS
      ${report.reviewComments || 'No review comments provided'}
      Reviewed on: ${report.reviewedAt ? new Date(report.reviewedAt).toLocaleString() : 'Unknown date'}
      ` : ''}
    `;
    
    // Create a blob and download
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${report.eventDetails.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded successfully');
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    
    const eventDate = new Date(report.eventDetails.date);
    const today = new Date();
    
    if (filter === 'upcoming' && eventDate > today) return true;
    if (filter === 'ongoing' && eventDate.toDateString() === today.toDateString()) return true;
    if (filter === 'completed' && eventDate < today) return true;
    
    return false;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Reports Dashboard</h1>
          <p className="text-xl text-gray-600">Access and manage all community reports in one place</p>
        </div>
        
        <div className="mb-8 flex justify-between items-center">
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilter('all')} 
              className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              All Reports
            </button>
            <button 
              onClick={() => setFilter('upcoming')} 
              className={`px-4 py-2 rounded-md ${filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Upcoming Events
            </button>
            <button 
              onClick={() => setFilter('ongoing')} 
              className={`px-4 py-2 rounded-md ${filter === 'ongoing' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Ongoing Events
            </button>
            <button 
              onClick={() => setFilter('completed')} 
              className={`px-4 py-2 rounded-md ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Completed Events
            </button>
          </div>
          <button 
            onClick={() => fetchReports()} 
            className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center"
          >
            <FaFilter className="mr-2" /> Refresh
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-8">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reports...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              <p>{error}</p>
              <button 
                onClick={() => fetchReports()} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Try Again
              </button>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <p>No reports found for the selected filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Community</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{report.eventDetails.title}</div>
                        <div className="text-sm text-gray-500">{report.eventDetails.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(report.eventDetails.date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{report.creator?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{report.creator?.email || 'No email'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : report.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : 'Not submitted'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleViewReport(report)} 
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEye className="inline mr-1" /> View
                        </button>
                        <button 
                          onClick={() => handleDownloadReport(report)} 
                          className="text-green-600 hover:text-green-900"
                        >
                          <FaDownload className="inline mr-1" /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="text-blue-500 text-2xl mb-3">
              <FaUsers className="inline-block" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Reports</h3>
            <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="text-green-500 text-2xl mb-3">
              <FaChartBar className="inline-block" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Submitted Reports</h3>
            <p className="text-3xl font-bold text-gray-900">
              {reports.filter(report => report.status === 'submitted' || report.status === 'reviewed').length}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="text-purple-500 text-2xl mb-3">
              <FaFileExport className="inline-block" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Reviewed Reports</h3>
            <p className="text-3xl font-bold text-gray-900">
              {reports.filter(report => report.status === 'reviewed').length}
            </p>
          </div>
        </div>
        
        {/* Report View Modal */}
        {showReportModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedReport.eventDetails.title}</h2>
                  <button 
                    onClick={() => setShowReportModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Event Details</h3>
                    <p><span className="font-medium">Date:</span> {new Date(selectedReport.eventDetails.date).toLocaleDateString()}</p>
                    <p><span className="font-medium">Location:</span> {selectedReport.eventDetails.location}</p>
                    <p><span className="font-medium">Category:</span> {selectedReport.eventDetails.category}</p>
                    <p><span className="font-medium">Description:</span> {selectedReport.eventDetails.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Participation</h3>
                    <p><span className="font-medium">Total Registered:</span> {selectedReport.participantData.totalRegistered}</p>
                    <p><span className="font-medium">Total Attended:</span> {selectedReport.participantData.totalAttended}</p>
                    <p><span className="font-medium">Attendance Rate:</span> {
                      selectedReport.participantData.totalRegistered > 0 
                        ? Math.round((selectedReport.participantData.totalAttended / selectedReport.participantData.totalRegistered) * 100) + '%'
                        : 'N/A'
                    }</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Highlights</h3>
                  <p className="bg-gray-50 p-4 rounded-md">{selectedReport.highlights || 'No highlights provided'}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Feedback</h3>
                  <p className="bg-gray-50 p-4 rounded-md">{selectedReport.feedback || 'No feedback provided'}</p>
                </div>
                
                {selectedReport.photos && selectedReport.photos.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Photos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedReport.photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img src={photo.url} alt={photo.caption || `Photo ${index + 1}`} className="w-full h-40 object-cover rounded-md" />
                          {photo.caption && <p className="text-sm text-gray-600 mt-1">{photo.caption}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Report Status</h3>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${selectedReport.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : selectedReport.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                    </span>
                    <span className="ml-4 text-sm text-gray-600">
                      {selectedReport.submittedAt 
                        ? `Submitted on ${new Date(selectedReport.submittedAt).toLocaleString()}` 
                        : 'Not submitted yet'}
                    </span>
                  </div>
                </div>
                
                {selectedReport.status === 'submitted' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Review Comments</h3>
                    <textarea
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      placeholder="Add your review comments here..."
                    ></textarea>
                  </div>
                )}
                
                {selectedReport.status === 'reviewed' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Review Comments</h3>
                    <p className="bg-gray-50 p-4 rounded-md">{selectedReport.reviewComments || 'No review comments provided'}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Reviewed on {selectedReport.reviewedAt ? new Date(selectedReport.reviewedAt).toLocaleString() : 'Unknown date'}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-4">
                  {selectedReport.status === 'submitted' && (
                    <button 
                      onClick={() => handleReviewReport(selectedReport._id)}
                      disabled={reviewLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reviewLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Reviewing...
                        </>
                      ) : (
                        <>Mark as Reviewed</>
                      )}
                    </button>
                  )}
                  <button 
                    onClick={() => handleDownloadReport(selectedReport)}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
                  >
                    <FaDownload className="mr-2" /> Download Report
                  </button>
                  <button 
                    onClick={() => setShowReportModal(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SuperAdminReports;
