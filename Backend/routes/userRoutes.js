const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
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

// Team member routes - protected
router.route('/team-members')
    .post(protect, addTeamMember);

module.exports = router;
