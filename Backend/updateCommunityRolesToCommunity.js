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

const updateCommunityRoles = async () => {
    try {
        await connectDB();
        
        console.log('🔄 Updating community roles to use "community" role...');
        
        // Find all users with names starting with "Community"
        const communityUsers = await User.find({
            name: { $regex: /^Community/i }
        });
        
        console.log(`Found ${communityUsers.length} community users to update`);
        
        let updatedCount = 0;
        
        for (const user of communityUsers) {
            const oldRole = user.role;
            user.role = 'community';
            await user.save();
            updatedCount++;
            
            console.log(`✅ Updated ${user.name}: ${oldRole} → community`);
        }
        
        console.log(`\n🎉 Successfully updated ${updatedCount} community users to use role "community"`);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        mongoose.connection.close();
    }
};

updateCommunityRoles();