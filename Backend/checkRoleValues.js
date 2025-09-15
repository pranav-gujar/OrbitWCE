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

const checkRoles = async () => {
    try {
        await connectDB();
        
        // Find all community-related users
        const users = await User.find({
            name: { $regex: /Community/i }
        });
        
        console.log('📊 Current Community Users and Their Roles:');
        console.log('==========================================');
        
        users.forEach(user => {
            console.log(`Name: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log('---');
        });
        
        console.log(`\nTotal community users found: ${users.length}`);
        
        // Check unique roles
        const uniqueRoles = [...new Set(users.map(u => u.role))];
        console.log(`Unique roles: ${uniqueRoles.join(', ')}`);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        mongoose.connection.close();
    }
};

checkRoles();