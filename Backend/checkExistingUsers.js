const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

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

const checkExistingUsers = async () => {
    try {
        await connectDB();
        
        // Find all community-related users
        const communityUsers = await User.find({
            $or: [
                { name: { $regex: 'Community', $options: 'i' } },
                { role: { $regex: 'community', $options: 'i' } }
            ]
        });
        
        console.log('📊 Existing Community Users:');
        console.log('Total found:', communityUsers.length);
        console.log('');
        
        communityUsers.forEach(user => {
            console.log(`- ${user.name}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Role: ${user.role}`);
            console.log(`  ID: ${user._id}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        mongoose.connection.close();
    }
};

// Run the check
if (require.main === module) {
    checkExistingUsers();
}