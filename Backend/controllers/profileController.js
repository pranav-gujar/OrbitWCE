const User = require('../models/User');

// @desc    Get current logged in user's profile
// @route   GET /api/users/profile
// @access  Private (any authenticated user)
exports.getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId)
            .select('-password -__v')
            .lean();
            
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching current user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
