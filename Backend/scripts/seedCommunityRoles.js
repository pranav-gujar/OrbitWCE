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

// 17 Community Role configurations
const communityRoles = [
    {
        name: 'Rotaract Club Of WCE Sangli',
        email: process.env.ROTARACT_COORDINATOR_EMAIL,
        password: process.env.ROTARACT_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Personality Advancement Circle of Engineers(PACE)',
        email: process.env.PACE_COORDINATOR_EMAIL,
        password: process.env.PACE_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Google Developer Groups(GDG WCE)',
        email: process.env.GDG_COORDINATOR_EMAIL,
        password: process.env.GDG_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'ACM WCE Chapter',
        email: process.env.ACM_COORDINATOR_EMAIL,
        password: process.env.ACM_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Art Circle',
        email: process.env.ART_COORDINATOR_EMAIL,
        password: process.env.ART_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Microsoft Learn Students Club(WCE MLSC)',
        email: process.env.MLSC_COORDINATOR_EMAIL,
        password: process.env.MLSC_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Walchand Linux User Group(WLUG)',
        email: process.env.WLUG_COORDINATOR_EMAIL,
        password: process.env.WLUG_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'ACSES Coordinator',
        email: process.env.ACSES_COORDINATOR_EMAIL,
        password: process.env.ACSES_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Electrical Engineering Students Association(EESA)',
        email: process.env.EESA_COORDINATOR_EMAIL,
        password: process.env.EESA_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Electronics Engineering Students Association(ELESA)',
        email: process.env.ELESA_COORDINATOR_EMAIL,
        password: process.env.ELESA_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Civil Engineering Students Association(CESA)',
        email: process.env.CESA_COORDINATOR_EMAIL,
        password: process.env.CESA_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Students Association of Information technology(SAIT)',
        email: process.env.SAIT_COORDINATOR_EMAIL,
        password: process.env.SAIT_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Mechanical Engineering Students Association(MESA)',
        email: process.env.MESA_COORDINATOR_EMAIL,
        password: process.env.MESA_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Association of Students for Theoretical Reasoning in AI(ASTRA)',
        email: process.env.ASTRA_COORDINATOR_EMAIL,
        password: process.env.ASTRA_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Student Organization For Technical Activities(SOFTA)',
        email: process.env.SOFTA_COORDINATOR_EMAIL,
        password: process.env.SOFTA_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'CodeChef WCE Chapter(CodeChef)',
        email: process.env.CODECHEF_COORDINATOR_EMAIL,
        password: process.env.CODECHEF_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Team Vulcan Robotics',
        email: process.env.VULCAN_COORDINATOR_EMAIL,
        password: process.env.VULCAN_COORDINATOR_PASSWORD,
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