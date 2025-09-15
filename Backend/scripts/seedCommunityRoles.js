const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/event-management-system');
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

// 12 Community Role configurations
const communityRoles = [
    {
        name: 'Community Youth Coordinator',
        email: process.env.COMMUNITY_YOUTH_COORDINATOR_EMAIL ,
        password: process.env.COMMUNITY_YOUTH_COORDINATOR_PASSWORD ,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Education Leader',
        email: process.env.COMMUNITY_EDUCATION_LEADER_EMAIL ,
        password: process.env.COMMUNITY_EDUCATION_LEADER_PASSWORD ,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Health Advocate',
        email: process.env.COMMUNITY_HEALTH_ADVOCATE_EMAIL ,
        password: process.env.COMMUNITY_HEALTH_ADVOCATE_PASSWORD ,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Environmental Lead',
        email: process.env.COMMUNITY_ENVIRONMENTAL_LEAD_EMAIL ,
        password: process.env.COMMUNITY_ENVIRONMENTAL_LEAD_PASSWORD ,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Arts & Culture',
        email: process.env.COMMUNITY_ARTS_CULTURE_EMAIL ,
        password: process.env.COMMUNITY_ARTS_CULTURE_PASSWORD ,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Sports Coordinator',
        email: process.env.COMMUNITY_SPORTS_COORDINATOR_EMAIL ,
        password: process.env.COMMUNITY_SPORTS_COORDINATOR_PASSWORD ,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Business Leader',
        email: process.env.COMMUNITY_BUSINESS_LEADER_EMAIL ,
        password: process.env.COMMUNITY_BUSINESS_LEADER_PASSWORD ,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Religious Leader',
        email: process.env.COMMUNITY_RELIGIOUS_LEADER_EMAIL ,
        password: process.env.COMMUNITY_RELIGIOUS_LEADER_PASSWORD ,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Social Worker',
        email: process.env.COMMUNITY_SOCIAL_WORKER_EMAIL ,
        password: process.env.COMMUNITY_SOCIAL_WORKER_PASSWORD ,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Tech Coordinator',
        email: process.env.COMMUNITY_TECH_COORDINATOR_EMAIL ,
        password: process.env.COMMUNITY_TECH_COORDINATOR_PASSWORD ,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Volunteer Coordinator',
        email: process.env.COMMUNITY_VOLUNTEER_COORDINATOR_EMAIL ,
        password: process.env.COMMUNITY_VOLUNTEER_COORDINATOR_PASSWORD ,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Senior Coordinator',
        email: process.env.COMMUNITY_SENIOR_COORDINATOR_EMAIL ,
        password: process.env.COMMUNITY_SENIOR_COORDINATOR_PASSWORD ,
        role: 'community',
        isVerified: true,
    }
];

// Function to seed community roles
const seedCommunityRoles = async () => {
    try {
        console.log('Starting community roles seeding...');

        
        // Hash passwords and create users
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const createdUsers = [];
        
        for (const roleConfig of communityRoles) {
            try {
                // Hash password
                const hashedPassword = await bcrypt.hash(roleConfig.password, saltRounds);
                
                // Create user object
                const userData = {
                    name: roleConfig.name,
                    email: roleConfig.email,
                    password: hashedPassword,
                    role: roleConfig.role,
                    isVerified: roleConfig.isVerified,
                };
                
                // Create user
                const user = new User(userData);
                await user.save();
                createdUsers.push(user);
                
                console.log(`✅ Created ${roleConfig.role}: ${roleConfig.email}`);
                
            } catch (error) {
                console.error(`❌ Error creating ${roleConfig.role}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Successfully seeded ${createdUsers.length} community roles!`);
        console.log('\n📋 Created Users:');
        createdUsers.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - ${user.role}`);
        });
        
    } catch (error) {
        console.error('Error seeding community roles:', error);
    } finally {
        mongoose.connection.close();
    }
};

// Run the seeding script
const runSeeding = async () => {
    await connectDB();
    await seedCommunityRoles();
};

// Handle command line execution
if (require.main === module) {
    runSeeding().catch(console.error);
}

module.exports = { seedCommunityRoles };