const mongoose = require('mongoose');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { isValidObjectId } = require('mongoose');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        const users = await User.find().select('-password -__v');
        
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        const { role } = req.body;
        const userId = req.params.id;

        // Validate role
        if (!['user', 'admin', 'superadmin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be one of: user, admin, superadmin'
            });
        }

        // Prevent modifying own role
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot modify your own role'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true, runValidators: true }
        ).select('-password -__v');

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
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        const userId = req.params.id;

        // Prevent deleting self
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private/Community
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { photo, bio, motto, website, teamMembers } = req.body;
        
        // Only allow community users to update these fields
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        
        if (user.role !== 'community') {
            return res.status(403).json({ 
                success: false,
                message: 'Only community users can update these profile fields' 
            });
        }
        
        // Update the user profile
        user.photo = photo || user.photo;
        user.bio = bio || user.bio;
        user.motto = motto || user.motto;
        user.website = website || user.website;

        // Safely handle teamMembers
        if (teamMembers && Array.isArray(teamMembers)) {
            user.teamMembers = teamMembers.map(member => {
                // Create a new object without _id if it's not a valid ObjectId
                const newMember = { ...member };
                if (member._id) {
                    if (mongoose.Types.ObjectId.isValid(member._id)) {
                        // If it's a valid ObjectId string, convert it
                        newMember._id = new mongoose.Types.ObjectId(member._id);
                    } else if (typeof member._id === 'string') {
                        // If it's a string but not a valid ObjectId, generate a new one
                        newMember._id = new mongoose.Types.ObjectId();
                    }
                } else {
                    // If no _id is provided, generate a new one
                    newMember._id = new mongoose.Types.ObjectId();
                }
                return newMember;
            });
        }

        await user.save();

        const updatedUser = await User.findById(userId).select('-password -__v');
        
        // Emit socket event for real-time updates
        const io = req.app.get('io');
        if (io) {
            console.log('Emitting profile_updated event for user:', userId);
            // Emit to everyone
            io.emit('profile_updated', updatedUser);
        }

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating community profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update user profile (for regular users)
// @route   PUT /api/users/profile/user
// @access  Private/User
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            name, 
            email, 
            phone, 
            address, 
            dateOfBirth, 
            bio, 
            photo, 
            skills, 
            socialLinks 
        } = req.body;
        
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Update basic profile fields
        if (name) user.name = name;
        if (email && email !== user.email) {
            // Check if email is already taken
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already in use by another account'
                });
            }
            user.email = email;
            user.isVerified = false; // Require email verification if email is changed
            // TODO: Send verification email
        }

        // Update profile fields
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (bio !== undefined) user.bio = bio;
        if (photo !== undefined) user.photo = photo;
        
        // Update skills (array of strings)
        if (skills && Array.isArray(skills)) {
            user.skills = [...new Set(skills)]; // Remove duplicates
        }

        // Update social links
        if (socialLinks && typeof socialLinks === 'object') {
            user.socialLinks = {
                ...user.socialLinks,
                ...socialLinks
            };
        }

        await user.save();

        // Return updated user data (excluding sensitive information)
        const updatedUser = await User.findById(userId)
            .select('-password -__v -resetPasswordToken -resetPasswordExpires -verificationToken');

        // Emit socket event for real-time updates
        const io = req.app.get('io');
        if (io) {
            console.log('Emitting profile_updated event for user:', userId);
            // Emit to everyone
            io.emit('profile_updated', updatedUser);
        }

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
