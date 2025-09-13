const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Broadcast a notification to all users
// @route   POST /api/notifications/broadcast
// @access  Private (community and superadmin)
exports.broadcastNotification = async (req, res) => {
    try {
        const { message, type } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // Only allow community and superadmin to broadcast
        if (!req.user || !['community', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Not authorized to broadcast' });
        }

        // Fetch all user ids
        const allUsers = await User.find({ role: 'user' }).select('_id');

        // Use 'new_event' as the default type for broadcasts since it's a valid type in the enum
        const notifications = await Promise.all(
            allUsers.map(u => Notification.create({
                recipient: u._id,
                message,
                type: 'new_event' // Changed from 'broadcast' to 'new_event' to match the enum
            }))
        );

        return res.status(201).json({
            success: true,
            count: notifications.length,
            message: 'Broadcast sent',
        });
    } catch (error) {
        console.error('Error broadcasting notification:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private
exports.createNotification = async (req, res) => {
    try {
        const { recipient, message, type, relatedEvent, rejectionReason } = req.body;

        // Create new notification
        const notification = await Notification.create({
            recipient,
            message,
            type,
            relatedEvent,
            rejectionReason: rejectionReason || ''
        });

        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .populate('relatedEvent')
            .sort({ createdAt: -1 }); // Sort by creation date, newest first

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Check if user is the recipient
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this notification'
            });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Check if user is the recipient
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this notification'
            });
        }

        await notification.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};