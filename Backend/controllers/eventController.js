const Event = require('../models/Event');
const User = require('../models/User');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// Helper function to get event counts
const getEventCounts = async () => {
  const counts = await Event.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Convert to object format
  const result = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0
  };
  
  counts.forEach(item => {
    result[item._id] = item.count;
    result.total += item.count;
  });
  
  return result;
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Community
exports.createEvent = async (req, res) => {
    try {
        // Check if user has community role
        if (req.user.role !== 'community') {
            return res.status(403).json({
                success: false,
                message: 'Only community users can create events'
            });
        }

        const { 
            title, 
            description, 
            date, 
            location, 
            imageUrl, 
            category, 
            coordinators, 
            links, 
            subEvents 
        } = req.body;

        // Create new event
        const event = await Event.create({
            title,
            description,
            date,
            location,
            imageUrl,
            category,
            coordinators,
            links,
            subEvents,
            creator: req.user.id,
            status: 'pending' // All events start as pending
        });

        // Emit socket event so superadmin panel updates in real-time
        const io = req.app.get('io');
        if (io) {
            io.emit('event_created', event);
        }

        res.status(201).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const jwt = require('jsonwebtoken');

// @desc    Get event counts by status
// @route   GET /api/events/counts
// @access Private
exports.getEventCounts = async (req, res) => {
    try {
        const now = new Date();
        const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        // Get all events that are approved
        const events = await Event.find({
            status: 'approved'
        });
        
        // Categorize events
        let upcoming = 0;
        let ongoing = 0;
        let completed = 0;
        
        events.forEach(event => {
            const eventDate = new Date(event.date);
            // Set end of day for the event date
            const eventEndDate = new Date(eventDate);
            eventEndDate.setHours(23, 59, 59, 999);
            
            // If event has ended (event date is before today)
            if (eventDate < now && eventDate.toDateString() !== now.toDateString()) {
                completed++;
            } 
            // If event is currently happening (event date is today)
            else if (eventDate.toDateString() === now.toDateString()) {
                ongoing++;
            }
            // If event is in the future
            else if (eventDate > now) {
                upcoming++;
            }
        });
        
        res.status(200).json({
            success: true,
            data: {
                upcoming,
                ongoing,
                completed,
                total: events.length
            },
            upcoming,
            ongoing,
            completed
        });
    } catch (error) {
        console.error('Error getting event counts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const { status, creator } = req.query;
        let query = {};

        // Determine requester role – check req.user (if protected) or decode header token
        let requesterRole = req.user?.role;
        if (!requesterRole && req.headers.authorization?.startsWith('Bearer ')) {
            const token = req.headers.authorization.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
                requesterRole = decoded.role;
            } catch (err) {
                // invalid token – treat as public requester
                requesterRole = null;
            }
        }

        // If requester is not superadmin, limit to approved events
        if (requesterRole !== 'superadmin') {
            query.status = 'approved';
        } else if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            // superadmin can filter by status via query param
            query.status = status;
        }
        
        // Filter by creator if provided
        if (creator) {
            query.creator = creator;
        }

        const events = await Event.find(query)
            .populate('creator', 'name email role communityName')
            .sort({ date: 1 }); // Sort by date ascending

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error getting events:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get all events with deletion requests
// @route   GET /api/events/deletion-requests
// @access  Private/Admin
exports.getDeletionRequests = async (req, res) => {
  try {
    // Check if user is a superadmin
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to view deletion requests'
        });
    }
    
    const events = await Event.find({ deletionRequested: true })
      .populate('creator', 'name email role');
    
    res.status(200).json({
        success: true,
        count: events.length,
        data: events
    });
  } catch (error) {
    console.error('Error fetching deletion requests:', error);
    res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
    });
  }
};

// @desc    Get events created by the logged-in community user
// @route   GET /api/events/my-events
// @access  Private/Community
exports.getMyEvents = async (req, res) => {
    try {
        // Check if user has community role
        if (req.user.role !== 'community') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const events = await Event.find({ creator: req.user.id })
            .populate('creator', 'name email role communityName')
            .sort({ createdAt: -1 }); // Sort by creation date, newest first

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error getting my events:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get a single event
// @route   GET /api/events/:id
// @access  Public/Private depending on status
exports.getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('creator', 'name email role');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // If event is not approved and user is not superadmin or the creator
        if (event.status !== 'approved' && 
            (!req.user || 
             (req.user.role !== 'superadmin' && 
              req.user.id !== event.creator.toString()))) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error getting event:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Community (own events only)
exports.updateEvent = async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is the event creator
        if (event.creator.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this event'
            });
        }

        // Allow event creators to edit their events even if approved
        // Only prevent editing rejected events
        if (event.status === 'rejected') {
            return res.status(400).json({
                success: false,
                message: `Cannot update event with status: ${event.status}`
            });
        }

        const { title, description, date, location, imageUrl, category, status } = req.body;

        // Only allow status updates to 'completed' for community users
        const updateData = { title, description, date, location, imageUrl, category };
        if (status === 'completed') {
            updateData.status = status;
        }

        event = await Event.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        // Emit socket event for real-time updates
        const io = req.app.get('io');
        if (io) {
            console.log('Emitting event_created for updated event:', event._id);
            io.emit('event_created', event);
            
            // Also emit to the creator's room
            io.to(`user_${event.creator}`).emit('event_created', event);
        }

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Request event deletion
// @route   PUT /api/events/:id/request-deletion
// @access  Private/Community (own events only)
exports.requestEventDeletion = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is the event creator
        if (event.creator.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to request deletion for this event'
            });
        }

        // Get deletion reason from request body
        const { reason } = req.body;

        // Update event with deletion request
        event.deletionRequested = true;
        event.deletionReason = reason || 'No reason provided';
        await event.save();

        // Emit socket event so admin page updates
        const io = req.app.get('io');
        if (io) {
            console.log('📢 Emitting deletion_requested for event:', event._id);
            io.emit('deletion_requested', event);
        } else {
            console.error('❌ io not available in request app');
        }

        // TODO: Send notification to admin about deletion request

        res.status(200).json({
            success: true,
            message: 'Deletion request submitted successfully. Awaiting admin approval.',
            data: event
        });
    } catch (error) {
        console.error('Error requesting event deletion:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Approve event deletion request
// @route   PUT /api/events/:id/approve-deletion
// @access  Private/SuperAdmin only
exports.approveEventDeletion = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is a superadmin
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to approve deletion requests'
            });
        }

        // Check if deletion was requested
        if (!event.deletionRequested) {
            return res.status(400).json({
                success: false,
                message: 'No deletion request exists for this event'
            });
        }

        // Store the event ID and creator ID before deletion
        const eventId = event._id.toString();
        const creatorId = event.creator._id?.toString() || event.creator.toString();
        
        // Delete the event
        await Event.findByIdAndDelete(req.params.id);

        // Get socket.io instance
        const io = req.app.get('io');
        if (!io) {
            console.error('❌ Socket.io instance not available in request');
            return res.status(200).json({
                success: true,
                message: 'Event deleted but socket.io not available for real-time updates',
                data: {}
            });
        }

        console.log('🔔 Emitting event_deleted for event:', eventId);
        console.log('👤 Creator ID for room:', creatorId);
        
        // Notify all clients that the event was deleted
        io.emit('event_deleted', eventId);
        
        // Notify the specific creator in their room (using the same event ID format for consistency)
        io.to(`user_${creatorId}`).emit('event_deleted', eventId);
        
        // Notify admin panel to remove from deletion requests
        io.emit('deletion_request_resolved', { eventId });
        
        console.log('✅ Socket events emitted for event deletion');

        // Create a notification for the event creator
        await Notification.create({
            recipient: creatorId,
            message: `Your event "${event.title}" has been deleted successfully.`,
            type: 'event_deleted',
            relatedEvent: eventId,
            isRead: false
        });

        // Emit socket event to notify the user
        io.to(`user_${creatorId}`).emit('new_notification', {
            message: `Your event "${event.title}" has been deleted successfully.`,
            type: 'event_deleted',
            eventId: eventId,
            timestamp: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Event deletion approved and completed',
            data: {}
        });
    } catch (error) {
        console.error('Error approving event deletion:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/SuperAdmin only
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Only superadmin can directly delete events now
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this event. Community users must request deletion.'
            });
        }

        await Event.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Approve or reject an event
// @route   PUT /api/events/:id/status
// @access  Private/SuperAdmin
exports.updateEventStatus = async (req, res) => {
    try {
        // Check if user is superadmin
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Only superadmins can approve or reject events'
            });
        }

        const { status, rejectionReason } = req.body;

        // Validate status
        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be approved or rejected'
            });
        }

        // If rejecting, require a reason
        if (status === 'rejected' && !rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { 
                status,
                rejectionReason: status === 'rejected' ? rejectionReason : ''
            },
            { new: true }
        ).populate('creator');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Emit socket events for real-time updates
        const io = req.app.get('io');
        if (io) {
            // Emit status update event
            console.log('📢 Emitting event_status_updated for event:', event._id);
            io.emit('event_status_updated', event);
            
            // Also emit event_created to ensure all clients get the update
            // This helps regular users see approved events immediately
            console.log('📢 Emitting event_created for status updated event:', event._id);
            io.emit('event_created', event);
        }

        // Create notification for event creator
        const Notification = require('../models/Notification');
        
        if (status === 'approved') {
            // Notification for event creator
            await Notification.create({
                recipient: event.creator._id,
                message: `Your event "${event.title}" has been approved.`,
                type: 'event_approved',
                relatedEvent: event._id
            });
            
            // Notification for all users about new event
            const allUsers = await User.find({ role: 'user' });
            const notificationPromises = allUsers.map(user => {
                return Notification.create({
                    recipient: user._id,
                    message: `New event coming soon: "${event.title}"`,
                    type: 'new_event',
                    relatedEvent: event._id
                });
            });
            
            await Promise.all(notificationPromises);
        } else if (status === 'rejected') {
            await Notification.create({
                recipient: event.creator._id,
                message: `Your event "${event.title}" has been rejected.`,
                type: 'event_rejected',
                relatedEvent: event._id,
                rejectionReason
            });
        }

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error updating event status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Like an event
// @route   PUT /api/events/:id/like
// @access  Private
exports.likeEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if event is approved
        if (event.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Cannot like an event that is not approved'
            });
        }

        // Check if user has already liked the event
        const user = await User.findById(userId);
        if (user.likedEvents.includes(eventId)) {
            return res.status(400).json({
                success: false,
                message: 'Event already liked'
            });
        }

        // Add event to user's liked events
        user.likedEvents.push(eventId);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Event liked successfully'
        });
    } catch (error) {
        console.error('Error liking event:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Unlike an event
// @route   PUT /api/events/:id/unlike
// @access  Private
exports.unlikeEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user has liked the event
        const user = await User.findById(userId);
        if (!user.likedEvents.includes(eventId)) {
            return res.status(400).json({
                success: false,
                message: 'Event not liked yet'
            });
        }

        // Remove event from user's liked events
        user.likedEvents = user.likedEvents.filter(id => id.toString() !== eventId);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Event unliked successfully'
        });
    } catch (error) {
        console.error('Error unliking event:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get user's liked events
// @route   GET /api/events/user/liked
// @access  Private
exports.getLikedEvents = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find user and populate liked events
        const user = await User.findById(userId).populate({
            path: 'likedEvents',
            match: { status: 'approved' } // Only return approved events
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            count: user.likedEvents.length,
            data: user.likedEvents
        });
    } catch (error) {
        console.error('Error getting liked events:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}