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

const checkAllUsers = async () => {
    try {
        await connectDB();
        
        // Get all users
        const users = await User.find({});
        
        console.log('📊 All Users and Their Roles:');
        console.log('============================');
        
        users.forEach(user => {
            console.log(`Name: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log('---');
        });
        
        console.log(`\nTotal users: ${users.length}`);
        
        // Group by role
        const rolesCount = {};
        users.forEach(user => {
            rolesCount[user.role] = (rolesCount[user.role] || 0) + 1;
        });
        
        console.log('\n📈 Role Distribution:');
        for (const [role, count] of Object.entries(rolesCount)) {
            console.log(`${role}: ${count}`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        mongoose.connection.close();
    }
};

checkAllUsers();