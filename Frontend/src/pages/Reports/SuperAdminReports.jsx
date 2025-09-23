import React, { useState, useEffect } from 'react';
import { 
  FaChartBar, 
  FaFileExport, 
  FaSearch, 
  FaUsers, 
  FaDownload, 
  FaEye, 
  FaFilter, 
  FaCalendarAlt,
  FaListAlt,
  FaTrophy,
  FaSync,
  FaCheck
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const SuperAdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [currentReportId, setCurrentReportId] = useState(null);
  const [showSubEvents, setShowSubEvents] = useState({});
  const [statistics, setStatistics] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalSubEvents: 0,
    
  });

  // Toggle sub-events visibility
  const toggleSubEvents = (reportId) => {
    setShowSubEvents(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };

  // Open review modal and set current report
  const openReviewModal = (reportId) => {
    setCurrentReportId(reportId);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  // Handle marking a report as reviewed
  const handleReviewReport = async () => {
    if (!currentReportId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/reports/${currentReportId}/review`,
        { 
          status: 'reviewed',
          reviewNotes: reviewNotes.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Update the local state to reflect the change
        setReports(prevReports => 
          prevReports.map(report => 
            report._id === currentReportId 
              ? { 
                  ...report, 
                  status: 'reviewed',
                  reviewNotes: reviewNotes.trim() || report.reviewNotes 
                } 
              : report
          )
        );
        
        setShowReviewModal(false);
        toast.success('Report reviewed successfully');
      } else {
        throw new Error(response.data.message || 'Failed to update report status');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error(error.response?.data?.message || 'Failed to update report status');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate registration percentage
  const getRegistrationPercentage = (report) => {
    if (!report.participantData?.totalRegistered) return 0;
    const maxCapacity = report.eventDetails?.maxParticipants || 100;
    return Math.min(Math.round((report.participantData.totalRegistered / maxCapacity) * 100), 100);
  };

  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
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
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch reports');
      toast.error('Failed to fetch reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Update statistics when reports change
  useEffect(() => {
    if (reports.length > 0) {
      const stats = reports.reduce((acc, report) => {
        const subEventsCount = report.eventDetails?.subEvents?.length || 0;
        const subEventRegistrations = (report.eventDetails?.subEvents || []).reduce(
          (sum, sub) => sum + (sub.participantData?.totalRegistered || 0), 
          0
        );

        return {
          totalEvents: acc.totalEvents + 1,
          totalRegistrations: acc.totalRegistrations + 
            (report.participantData?.totalRegistered || 0) + 
            subEventRegistrations,
          totalSubEvents: acc.totalSubEvents + subEventsCount
        };
      }, {
        totalEvents: 0,
        totalRegistrations: 0,
        totalSubEvents: 0
      });
      
      setStatistics(stats);
    }
  }, [reports]);

  // Filter and sort reports based on selected filter
  const filteredReports = [...reports].filter(report => {
    if (filter === 'all') return true;
    if (!report.eventDetails?.date) return false;
    
    const eventDate = new Date(report.eventDetails.date);
    const today = new Date();
    
    if (filter === 'upcoming' && eventDate > today) return true;
    if (filter === 'ongoing' && eventDate.toDateString() === today.toDateString()) return true;
    if (filter === 'completed' && eventDate < today) return true;
    if (filter === 'withSubEvents' && report.eventDetails?.subEvents?.length > 0) return true;
    if (filter === 'highEngagement') return true; // We'll sort these by registration count
    if (filter === 'needsReview' && report.status === 'submitted') return true;
    
    return false;
  }).sort((a, b) => {
    // For high engagement, sort by registration count in descending order
    if (filter === 'highEngagement') {
      const aRegistrations = a.participantData?.totalRegistered || 0;
      const bRegistrations = b.participantData?.totalRegistered || 0;
      return bRegistrations - aRegistrations;
    }
    return 0; // No sorting for other filters
  });

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['Event', 'Date', 'Registrations', 'Status'];
    const csvContent = [
      headers.join(','),
      ...reports.map(report => [
        `"${report.eventDetails?.title || 'N/A'}"`,
        `"${formatDate(report.eventDetails?.date) || 'N/A'}"`,
        report.participantData?.totalRegistered || 0,
        `"${report.status || 'N/A'}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `event-reports-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle report download
  const handleDownloadReport = (report) => {
    const reportText = `
      EVENT REPORT
      
      Title: ${report.eventDetails?.title || 'N/A'}
      Date: ${formatDate(report.eventDetails?.date)}
      Location: ${report.eventDetails?.location || 'N/A'}
      Category: ${report.eventDetails?.category || 'N/A'}
      
      STATISTICS
      Total Registered: ${report.participantData?.totalRegistered || 0}
      Total Attended: ${report.participantData?.totalAttended || 0}
      
      ${report.eventDetails?.subEvents?.length ? `
      SUB-EVENTS (${report.eventDetails.subEvents.length})
      ${report.eventDetails.subEvents.map((se, i) => 
        `${i + 1}. ${se.name || 'Unnamed'} - ${se.totalRegistered || 0} registered`
      ).join('\n      ')}
      ` : ''}
    `;
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${report.eventDetails?.title?.replace(/\s+/g, '_') || 'report'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded successfully');
  };

  // Set up socket listeners
  useEffect(() => {
    // Import socket dynamically to avoid SSR issues
    import('../../socket').then(({ default: socket }) => {
      if (!socket.connected) {
        socket.connect();
      }
      
      const handleNewReport = (newReport) => {
        setReports(prev => [newReport, ...prev]);
        toast.info(`New report: ${newReport.eventDetails?.title || 'Untitled Event'}`);
      };
      
      const handleReportUpdate = (updatedReport) => {
        setReports(prev => 
          prev.map(r => r._id === updatedReport._id ? updatedReport : r)
        );
      };
      
      socket.on('new_report_submitted', handleNewReport);
      socket.on('report_updated', handleReportUpdate);
      
      // Initial fetch
      fetchReports();
      
      return () => {
        if (socket) {
          socket.off('new_report_submitted', handleNewReport);
          socket.off('report_updated', handleReportUpdate);
          if (socket.connected) {
            socket.disconnect();
          }
        }
      };
    }).catch(error => {
      console.error('Failed to initialize socket:', error);
      // Fallback to just fetch reports if socket fails
      fetchReports();
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>Error loading reports: {error}</p>
        <button 
          onClick={fetchReports}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Event Analytics Dashboard</h1>
        
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <FaCalendarAlt className="text-2xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Events</p>
                <p className="text-2xl font-bold">{statistics.totalEvents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <FaUsers className="text-2xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Registrations</p>
                <p className="text-2xl font-bold">{statistics.totalRegistrations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <FaListAlt className="text-2xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Sub-Events</p>
                <p className="text-2xl font-bold">{statistics.totalSubEvents}</p>
              </div>
            </div>
          </div>
          
        </div>

        {/* Filters and Actions */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter('all')} 
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              All Reports
            </button>
            <button 
              onClick={() => setFilter('upcoming')} 
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'upcoming' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setFilter('ongoing')} 
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'ongoing' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Ongoing
            </button>
            <button 
              onClick={() => setFilter('completed')} 
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'completed' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Completed
            </button>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full md:w-48 pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Events</option>
              <option value="withSubEvents">With Sub-Events</option>
              <option value="highEngagement">High Engagement</option>
              <option value="needsReview">Needs Review</option>
            </select>
            
            <button
              onClick={fetchReports}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Refresh data"
            >
              <FaSync className="mr-2" /> Refresh
            </button>
            
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Export to CSV"
            >
              <FaDownload className="mr-2" /> Export
            </button>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registrations
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
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <React.Fragment key={report._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaCalendarAlt className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {report.eventDetails?.title || 'Untitled Event'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {report.eventDetails?.category || 'No category'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(report.eventDetails?.date)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {report.eventDetails?.location || 'Location not specified'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {report.participantData?.totalRegistered || 0} registered
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${getRegistrationPercentage(report)}%` }}
                            ></div>
                          </div>
                         
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            report.status === 'draft' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : report.status === 'submitted' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {report.status?.charAt(0).toUpperCase() + (report.status?.slice(1) || '')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setShowReportModal(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              title="View details"
                            >
                              <FaEye className="mr-1.5 h-3.5 w-3.5" /> View
                            </button>
                            {report.status === 'submitted' && (
                              <button
                                onClick={() => openReviewModal(report._id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                title="Add review and mark as reviewed"
                              >
                                <FaCheck className="mr-1.5 h-3.5 w-3.5" /> Review
                              </button>
                            )}
                            {report.eventDetails?.subEvents?.length > 0 && (
                              <button
                                onClick={() => toggleSubEvents(report._id)}
                                className="inline-flex items-center px-3 py-1.5 border border-purple-200 text-xs font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                title="Toggle sub-events"
                              >
                                {showSubEvents[report._id] ? 'Hide Sub-Events' : 'Show Sub-Events'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Sub-events row */}
                      {showSubEvents[report._id] && report.eventDetails?.subEvents?.length > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan="5" className="px-6 py-4">
                            <div className="ml-12 pl-4 border-l-2 border-gray-200">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Sub-Events ({report.eventDetails.subEvents.length}):</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {report.eventDetails.subEvents.map((subEvent, idx) => (
                                  <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                    <div className="flex flex-col h-full">
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900 flex items-center">
                                          {subEvent.name || 'Unnamed Sub-Event'}
                                          {subEvent.prize && (
                                            <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                              <FaTrophy className="inline mr-1" /> Prize: {subEvent.prize}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                          {formatDate(subEvent.date)} • {subEvent.venue || 'Venue TBD'}
                                        </div>
                                        {subEvent.description && (
                                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                            {subEvent.description}
                                          </p>
                                        )}
                                      </div>
                                      <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium text-gray-900">
                                            {subEvent.totalRegistered || 0} registered
                                          </span>
                                          {subEvent.fee > 0 && (
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                              ₹{subEvent.fee}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No reports found matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedReport.eventDetails?.title || 'Event Report'}
                </h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedReport.eventDetails?.date) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedReport.eventDetails?.location || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedReport.eventDetails?.category || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedReport.status === 'draft' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : selectedReport.status === 'submitted' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedReport.status?.charAt(0).toUpperCase() + (selectedReport.status?.slice(1) || '')}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                    {selectedReport.eventDetails?.description || 'No description available.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Total Registered</h3>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {selectedReport.participantData?.totalRegistered || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Total Attended</h3>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {selectedReport.participantData?.totalAttended || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Engagement</h3>
                    <div className="mt-1 flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-500 h-2.5 rounded-full" 
                          style={{ width: `${getRegistrationPercentage(selectedReport)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {getRegistrationPercentage(selectedReport)}%
                      </span>
                    </div>
                  </div>
                </div>

                {selectedReport.eventDetails?.subEvents?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Sub-Events</h3>
                    <div className="space-y-3">
                      {selectedReport.eventDetails.subEvents.map((subEvent, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-gray-900">
                              {subEvent.name || `Sub-Event ${idx + 1}`}
                            </h4>
                            <span className="text-sm font-medium text-gray-900">
                              {subEvent.totalRegistered || 0} registered
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            {formatDate(subEvent.date)} • {subEvent.venue || 'Venue TBD'}
                          </div>
                          {subEvent.prize && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <FaTrophy className="mr-1" /> Prize: {subEvent.prize}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadReport(selectedReport)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaDownload className="mr-2 -ml-1" />
                    Download Full Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Review Report</h2>
            
            <div className="mb-4">
              <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Your Insights & Notes
              </label>
              <textarea
                id="reviewNotes"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add your review notes, insights, or feedback..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewReport}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <FaCheck className="mr-2" />
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminReports;
