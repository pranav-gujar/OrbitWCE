const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createNotification,
    getUserNotifications,
    markAsRead,
    deleteNotification,
    broadcastNotification
} = require('../controllers/notificationController');

// Routes
router.post('/', protect, createNotification);
router.post('/broadcast', protect, broadcastNotification);
router.get('/', protect, getUserNotifications);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;