const express = require('express');
const { registerForEvent, getEventRegistrations } = require('../controllers/eventRegistrationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// Public route for registering for an event
router.post('/register', registerForEvent);

// Protected route for getting registrations (only for event creator or admin)
router.get('/registrations', protect, getEventRegistrations);

module.exports = router;