const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail/sendEmail');
const logger = require('../utils/logger');
const { 
    getUsers, 
    getCommunityUsers,
    getCommunityUserById,
    updateUserRole, 
    deleteUser,
    updateProfile,
    updateUserProfile,
    addTeamMember 
} = require('../controllers/userController');
const { getCurrentUser } = require('../controllers/profileController');

// Public routes - no authentication required
router.route('/community')
    .get(getCommunityUsers);

router.route('/community/:id')
    .get(getCommunityUserById);

// Apply authentication middleware to all routes below
router.use(protect);

// User management routes
router.route('/')
    .get(getUsers);

// Get current logged in user's profile
router.route('/profile')
    .get(getCurrentUser);

// Community profile update
router.route('/profile/update')
    .put(updateProfile);

// Regular user profile update (matches frontend's /api/users/profile/user)
router.route('/profile/user')
    .put(updateUserProfile);
    
router.route('/:id/role')
    .put(updateUserRole);

router.route('/:id')
    .delete(deleteUser);

// Test email endpoint
router.get('/test-email', async (req, res) => {
    try {
        const testEmail = process.env.TEST_EMAIL || 'your-email@example.com';
        logger.info('Sending test email to:', testEmail);
        
        const result = await sendEmail(
            testEmail,
            'Test Email from PGT Global Networks',
            '<h1>Test Email</h1><p>This is a test email from PGT Global Networks.</p>'
        );
        
        res.status(200).json({
            success: true,
            message: 'Test email sent successfully',
            details: result
        });
    } catch (error) {
        logger.error('Test email failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error.message,
            details: error.details || {}
        });
    }
});

// Team member routes - protected
router.route('/team-members')
    .post(protect, addTeamMember);

module.exports = router;
