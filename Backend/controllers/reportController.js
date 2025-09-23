const Report = require('../models/Report');
const Event = require('../models/Event');
const User = require('../models/User');
const { UnauthorizedError, ForbiddenError, NotFoundError } = require('../utils/errorHandler');

// @desc    Create a new report or get existing report for an event
// @route   POST /api/reports/event/:eventId
// @access  Private (community role)
exports.createOrGetReport = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // Check if event exists and belongs to the user
        const event = await Event.findOne({ _id: eventId, creator: req.user.id });
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or you do not have permission to access it'
            });
        }
        
        // Check if event is completed
        if (event.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot create a report for an event that is not completed'
            });
        }
        
        // Check if report already exists
        let report = await Report.findOne({ event: eventId });
        
        if (report) {
            return res.status(200).json({
                success: true,
                data: report,
                message: 'Report already exists for this event'
            });
        }
        
        // Get event registrations for participant data
        const registrations = event.registrations || [];
        const likes = event.likes || [];
        
        // Process sub-events data
        const subEventsData = (event.subEvents || []).map(subEvent => ({
            name: subEvent.name,
            date: subEvent.date,
            venue: subEvent.venue,
            description: subEvent.description,
            totalRegistered: subEvent.registrations?.length || 0,
            participants: (subEvent.registrations || []).map(reg => ({
                name: reg.name,
                email: reg.email,
                phone: reg.phone,
                instituteName: reg.instituteName,
                registeredAt: reg.registeredAt
            })),
            fee: subEvent.fee,
            prize: subEvent.prize
        }));
        
        // Calculate total registrations including sub-events
        const totalSubEventRegistrations = subEventsData.reduce(
            (total, subEvent) => total + (subEvent.participants?.length || 0), 0
        );
        
        // Create new report with enhanced data
        report = new Report({
            event: eventId,
            creator: req.user.id,
            eventDetails: {
                title: event.title,
                date: event.date,
                location: event.location,
                description: event.description,
                category: event.category,
                totalLikes: likes.length,
                subEvents: subEventsData.length > 0 ? subEventsData : undefined
            },
            participantData: {
                totalRegistered: registrations.length + totalSubEventRegistrations,
                totalMainEventRegistrations: registrations.length,
                totalSubEventRegistrations: totalSubEventRegistrations,
                totalAttended: event.attendees || 0,
                participants: [
                    ...registrations.map(reg => ({
                        name: reg.name,
                        email: reg.email,
                        phone: reg.phone,
                        instituteName: reg.instituteName,
                        role: 'Main Event Participant',
                        registeredAt: reg.registeredAt
                    })),
                    ...subEventsData.flatMap((subEvent, index) => 
                        subEvent.participants.map(participant => ({
                            ...participant,
                            role: `Sub-Event: ${subEvent.name}`,
                            subEvent: subEvent.name
                        }))
                    )
                ]
            },
            highlights: `${event.title} was successfully held on ${new Date(event.date).toLocaleDateString()}.`,
            feedback: 'Participants enjoyed the event and provided positive feedback.'
        });
        
        await report.save();
        
        res.status(201).json({
            success: true,
            data: report,
            message: 'Report created successfully'
        });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create report'
        });
    }
};

// @desc    Get all reports for the logged-in community user
// @route   GET /api/reports
// @access  Private (community role)
exports.getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ creator: req.user.id })
            .populate('event', 'title date location status')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch reports'
        });
    }
};

// @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Private (community role for own reports, superadmin for all)
exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('event', 'title date location status creator')
            .populate('creator', 'name email');
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }
        
        // Check if user has permission to access this report
        if (req.user.role !== 'superadmin' && report.creator._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this report'
            });
        }
        
        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch report'
        });
    }
};

// @desc    Update a report
// @route   PUT /api/reports/:id
// @access  Private (community role for own reports)
exports.updateReport = async (req, res) => {
    try {
        let report = await Report.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }
        
        // Check if user has permission to update this report
        if (report.creator.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this report'
            });
        }
        
        // Only allow updates to certain fields
        const { highlights, feedback, notes, photos } = req.body;
        
        const updateData = {};
        if (highlights !== undefined) updateData.highlights = highlights;
        if (feedback !== undefined) updateData.feedback = feedback;
        if (notes !== undefined) updateData.notes = notes;
        if (photos !== undefined) updateData.photos = photos;
        
        report = await Report.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            data: report,
            message: 'Report updated successfully'
        });
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update report'
        });
    }
};

// @desc    Submit a report to superadmin
// @route   PUT /api/reports/:id/submit
// @access  Private (community role for own reports)
exports.submitReport = async (req, res) => {
    try {
        let report = await Report.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }
        
        // Check if user has permission to submit this report
        if (report.creator.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to submit this report'
            });
        }
        
        // Update report status to submitted
        report = await Report.findByIdAndUpdate(
            req.params.id,
            { 
                $set: { 
                    status: 'submitted',
                    isSubmitted: true,
                    submittedAt: new Date()
                } 
            },
            { new: true }
        )
        .populate({
            path: 'event',
            select: 'title date location status',
            options: { strictPopulate: false }
        })
        .populate({
            path: 'creator',
            select: 'name email',
            options: { strictPopulate: false }
        });
        
        // Emit socket event for real-time updates
        const io = req.app.get('io');
        if (io) {
            io.emit('new_report_submitted', report);
            
            // Also notify superadmins specifically
            const superadmins = await User.find({ role: 'superadmin' });
            superadmins.forEach(admin => {
                io.to(`user_${admin._id}`).emit('new_report_notification', {
                    message: `New report submitted for event: ${report.event?.title || 'Unknown Event'}`,
                    reportId: report._id
                });
            });
        }
        
        res.status(200).json({
            success: true,
            data: report,
            message: 'Report submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting report:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to submit report'
        });
    }
};

// @desc    Get all reports (for superadmin)
// @route   GET /api/reports/all
// @access  Private (superadmin only)
exports.getAllReports = async (req, res) => {
    try {
        // Only superadmin can access all reports
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access all reports'
            });
        }
        
        const reports = await Report.find({})
            .populate({
                path: 'event',
                select: 'title date location status',
                options: { strictPopulate: false }
            })
            .populate({
                path: 'creator',
                select: 'name email',
                options: { strictPopulate: false }
            })
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        console.error('Error fetching all reports:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch reports'
        });
    }
};

// @desc    Review a report (for superadmin)
// @route   PUT /api/reports/:id/review
// @access  Private (superadmin only)
exports.reviewReport = async (req, res) => {
    try {
        // Only superadmin can review reports
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to review reports'
            });
        }
        
        const { reviewComments } = req.body;
        
        let report = await Report.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }
        
        // Update report with review information
        report = await Report.findByIdAndUpdate(
            req.params.id,
            { 
                $set: { 
                    status: 'reviewed',
                    reviewedBy: req.user.id,
                    reviewedAt: new Date(),
                    reviewComments: reviewComments || ''
                } 
            },
            { new: true }
        )
        .populate({
            path: 'event',
            select: 'title date location status',
            options: { strictPopulate: false }
        })
        .populate({
            path: 'creator',
            select: 'name email',
            options: { strictPopulate: false }
        });
        
        // Emit socket event for real-time updates
        const io = req.app.get('io');
        if (io) {
            io.emit('report_updated', report);
            
            // Notify the report creator
            if (report.creator && report.creator._id) {
                io.to(`user_${report.creator._id}`).emit('report_reviewed', {
                    message: `Your report for event ${report.event?.title || 'Unknown Event'} has been reviewed`,
                    reportId: report._id
                });
            }
        }
        
        res.status(200).json({
            success: true,
            data: report,
            message: 'Report reviewed successfully'
        });
    } catch (error) {
        console.error('Error reviewing report:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to review report'
        });
    }
};