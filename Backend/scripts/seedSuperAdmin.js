const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Get MongoDB URI from environment or use default local MongoDB
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/event-management';
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'superadmin@example.com';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@123';

if (!process.env.MONGO_URI) {
    console.warn('Warning: MONGO_URI not found in .env file, using default local MongoDB');
}

const seedSuperAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected successfully');

        // Find any existing superadmin
        const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
        
        // Hash new password
        console.log('Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, salt);

        if (existingSuperAdmin) {
            console.log('ℹ️  Updating existing superadmin...');
            
            // Check if the email is being changed
            if (existingSuperAdmin.email !== SUPERADMIN_EMAIL) {
                console.log(`Updating email from ${existingSuperAdmin.email} to ${SUPERADMIN_EMAIL}`);
                existingSuperAdmin.email = SUPERADMIN_EMAIL;
            }
            
            // Update existing superadmin
            existingSuperAdmin.password = hashedPassword;
            existingSuperAdmin.role = 'superadmin';
            existingSuperAdmin.isVerified = true;
            existingSuperAdmin.name = 'Super Admin';
            
            await existingSuperAdmin.save();
            console.log('✅ Superadmin updated successfully');
        } else {
            // Create new superadmin if no superadmin exists
            console.log('Creating new superadmin user...');
            const superAdmin = new User({
                name: 'Super Admin',
                email: SUPERADMIN_EMAIL,
                password: hashedPassword,
                role: 'superadmin',
                isVerified: true
            });

            await superAdmin.save();
            console.log('✅ Superadmin created successfully');
        }
        console.log('Email:', SUPERADMIN_EMAIL);
        console.log('Password:', SUPERADMIN_PASSWORD);
        console.log('\n⚠️  IMPORTANT: Change this password after first login!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding superadmin:');
        console.error(error.message);
        
        if (error.code === 'EADDRINUSE') {
            console.error('\nError: Port is already in use. Please check if another instance is running.');
        } else if (error.name === 'MongoServerError' && error.code === 8000) {
            console.error('\nError: Could not connect to MongoDB. Please check your connection string and ensure MongoDB is running.');
            console.log('\nIf using a local MongoDB, you can start it with: mongod');
        } else if (error.name === 'MongooseServerSelectionError') {
            console.error('\nError: Could not connect to MongoDB. Please check your connection string and ensure MongoDB is running.');
            console.log('\nIf using a local MongoDB, you can start it with: mongod');
        }
        
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Run the seed function
seedSuperAdmin();


