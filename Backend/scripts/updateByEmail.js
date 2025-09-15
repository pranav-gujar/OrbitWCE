const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

// Function to update specific user by their current email
const updateByCurrentEmail = async (currentEmail, newEmail, newPassword) => {
    try {
        await connectDB();
        
        console.log(`Looking for user with email: ${currentEmail}`);
        
        // Find user by current email
        const existingUser = await User.findOne({ email: currentEmail });
        
        if (!existingUser) {
            console.log(`❌ User with email ${currentEmail} not found`);
            return false;
        }
        
        console.log(`✅ Found user: ${existingUser.name} (${existingUser.email})`);
        
        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Update the user
        const updatedUser = await User.findOneAndUpdate(
            { email: currentEmail },
            {
                email: newEmail,
                password: hashedPassword,
            },
            { new: true }
        );
        
        console.log(`✅ Successfully updated:`);
        console.log(`   Name: ${updatedUser.name}`);
        console.log(`   Old Email: ${currentEmail}`);
        console.log(`   New Email: ${updatedUser.email}`);
        console.log(`   Role: ${updatedUser.role}`);
        
        return true;
        
    } catch (error) {
        console.error('Error:', error.message);
        return false;
    } finally {
        mongoose.connection.close();
    }
};

// Function to update Community Youth Coordinator specifically
const updateCommunityYouthCoordinator = async () => {
    return await updateByCurrentEmail(
        'youth@community.org',           // Current email
        process.env.COMMUNITY_YOUTH_COORDINATOR_EMAIL,  // New email from .env
        process.env.COMMUNITY_YOUTH_COORDINATOR_PASSWORD  // New password from .env
    );
};

// Run the update
const runUpdate = async () => {
    const args = process.argv.slice(2);
    
    if (args.length === 3) {
        // Usage: node updateByEmail.js current@email.com new@email.com newPassword
        const [currentEmail, newEmail, newPassword] = args;
        await updateByCurrentEmail(currentEmail, newEmail, newPassword);
    } else if (args.length === 1 && args[0] === 'youth') {
        // Update Community Youth Coordinator specifically
        await updateCommunityYouthCoordinator();
    } else {
        console.log('Usage:');
        console.log('  node updateByEmail.js current@email.com new@email.com newPassword');
        console.log('  node updateByEmail.js youth');
    }
};

if (require.main === module) {
    runUpdate();
}

module.exports = { updateByCurrentEmail };