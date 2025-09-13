const express = require('express');
const router = express.Router();
const { 
    createEvent, 
    getEvents, 
    getEvent, 
    updateEvent, 
    deleteEvent, 
    updateEventStatus,
    getMyEvents,
    requestEventDeletion,
    approveEventDeletion,
    getDeletionRequests,
    likeEvent,
    unlikeEvent,
    getLikedEvents,
    getEventCounts
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Import event registration routes
const eventRegistrationRoutes = require('./eventRegistrationRoutes');

// Public routes
router.get('/', getEvents);

// Admin routes that must be declared before parameterized routes
router.get('/deletion-requests', protect, authorize('superadmin'), getDeletionRequests);
router.get('/counts', protect, getEventCounts);

// User routes that must be declared before parameterized routes
router.get('/user/my-events', protect, authorize('community'), getMyEvents);
router.get('/user/liked', protect, getLikedEvents);

// Parameterized route must come after specific routes
router.get('/:id', getEvent);

// Use event registration routes
router.use('/:id', eventRegistrationRoutes);

// Protected routes
router.post('/', protect, authorize('community'), createEvent);
router.get('/user/my-events', protect, authorize('community'), getMyEvents);
router.put('/:id', protect, authorize('community'), updateEvent);
router.delete('/:id', protect, authorize('superadmin'), deleteEvent);
router.put('/:id/request-deletion', protect, authorize('community'), requestEventDeletion);
router.put('/:id/approve-deletion', protect, authorize('superadmin'), approveEventDeletion);
router.put('/:id/status', protect, authorize('superadmin'), updateEventStatus);

// Like/unlike routes
router.put('/:id/like', protect, likeEvent);
router.put('/:id/unlike', protect, unlikeEvent);

module.exports = router;