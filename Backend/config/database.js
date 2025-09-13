const mongoose = require('mongoose');

const database = async () => {
    try {
        console.log('🔄 Attempting to connect to MongoDB...');
        
        // Default to local MongoDB if no URI is provided
        const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/event-management';
        
        if (!process.env.MONGO_URI) {
            console.warn('⚠️  MONGO_URI not found in .env, using default local MongoDB');
        } else {
            console.log('Using MongoDB Atlas connection');
        }

        // Connection options
        const options = {
            serverSelectionTimeoutMS: 10000, // Increase timeout to 10s
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            family: 4, // Use IPv4, skip trying IPv6
            maxPoolSize: 10,
            retryWrites: true,
            w: 'majority'
        };

        console.log('Connecting to MongoDB...');
        
        // Connect to MongoDB with retry logic
        let attempts = 0;
        const maxAttempts = 3;
        let lastError = null;

        while (attempts < maxAttempts) {
            try {
                attempts++;
                console.log(`Connection attempt ${attempts} of ${maxAttempts}...`);
                
                await mongoose.connect(MONGODB_URI, options);
                
                // If we get here, connection was successful
                console.log('✅ MongoDB connected successfully');
                
                // Set up event listeners
                mongoose.connection.on('connected', () => {
                    console.log('✅ MongoDB connected');
                    
                    
                });

                mongoose.connection.on('error', (err) => {
                    console.error('❌ MongoDB connection error:', err.message);
                    if (err.name === 'MongooseServerSelectionError') {
                        console.error('This error usually indicates that the MongoDB server is not running, or the connection string is incorrect.');
                        console.error('Please check your MongoDB server status and connection string.');
                    }
                });

                mongoose.connection.on('disconnected', () => {
                    console.log('ℹ️  MongoDB disconnected');
                });

                // Test the connection
                await mongoose.connection.db.admin().ping();
                console.log('MongoDB server responded to ping!');
                
                return mongoose.connection;
                
            } catch (error) {
                lastError = error;
                console.error(`❌ Connection attempt ${attempts} failed:`, error.message);
                
                if (attempts < maxAttempts) {
                    // Wait before retrying (exponential backoff)
                    const waitTime = Math.pow(2, attempts) * 1000;
                    console.log(`Retrying in ${waitTime/1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }
        
        // If we get here, all attempts failed
        throw new Error(`Failed to connect to MongoDB after ${maxAttempts} attempts. Last error: ${lastError.message}`);

    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        console.error('Error details:', error);
        
        if (error.name === 'MongoServerSelectionError') {
            console.error('\nTroubleshooting tips:');
            console.error('1. Check if MongoDB is running');
            console.error('2. Verify your connection string in .env file');
            console.error('3. If using MongoDB Atlas, ensure your IP is whitelisted');
            console.error('4. Check your internet connection');
        }
        
        process.exit(1);
    }
}

module.exports = database;