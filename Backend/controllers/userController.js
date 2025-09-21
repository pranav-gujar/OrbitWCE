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

// @desc    Get all community users (Public)
// @route   GET /api/users/community
// @access  Public
exports.getCommunityUsers = async (req, res) => {
    try {
        const communityUsers = await User.find({ role: 'community' })
            .select('-password -__v -email')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: communityUsers.length,
            data: communityUsers
        });
    } catch (error) {
        console.error('Error getting community users:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get single community user by ID (Public)
// @route   GET /api/users/community/:id
// @access  Public
exports.getCommunityUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }
        
        const communityUser = await User.findOne({ _id: id, role: 'community' })
            .select('-password -__v');
        
        if (!communityUser) {
            return res.status(404).json({
                success: false,
                message: 'Community user not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: communityUser
        });
    } catch (error) {
        console.error('Error getting community user by ID:', error);
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
        const { 
            name,
            bio, 
            motto, 
            website, 
            teamMembers,
            photo,
            phone,
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
        
        if (user.role !== 'community') {
            return res.status(403).json({ 
                success: false,
                message: 'Only community users can update these profile fields' 
            });
        }

        // Update basic profile fields
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (motto !== undefined) user.motto = motto;
        if (website !== undefined) user.website = website;
        if (photo !== undefined) user.photo = photo;
        if (phone !== undefined) user.phone = phone;

        // Handle social links
        if (socialLinks && typeof socialLinks === 'object') {
            user.socialLinks = {
                ...user.socialLinks,
                ...socialLinks
            };
        }

        // Handle team members
        if (teamMembers && Array.isArray(teamMembers)) {
            user.teamMembers = teamMembers.map(member => {
                const newMember = { ...member };
                if (member._id) {
                    if (mongoose.Types.ObjectId.isValid(member._id)) {
                        newMember._id = new mongoose.Types.ObjectId(member._id);
                    } else if (typeof member._id === 'string') {
                        newMember._id = new mongoose.Types.ObjectId();
                    }
                } else {
                    newMember._id = new mongoose.Types.ObjectId();
                }
                return newMember;
            });
        }

        await user.save();

        // Get updated user data without sensitive information
        const updatedUser = await User.findById(userId)
            .select('-password -__v -resetPasswordToken -resetPasswordExpires -verificationToken');
        
        // Emit socket event for real-time updates
        const io = req.app.get('io');
        if (io) {
            console.log('Emitting profile_updated event for user:', userId);
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
