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

// 12 Community Role configurations with specific role types
const communityRoles = [
    {
        name: 'Community Youth Coordinator',
        email: process.env.COMMUNITY_YOUTH_COORDINATOR_EMAIL,
        password: process.env.COMMUNITY_YOUTH_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Education Leader',
        email: process.env.COMMUNITY_EDUCATION_LEADER_EMAIL,
        password: process.env.COMMUNITY_EDUCATION_LEADER_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Health Advocate',
        email: process.env.COMMUNITY_HEALTH_ADVOCATE_EMAIL,
        password: process.env.COMMUNITY_HEALTH_ADVOCATE_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Environmental Lead',
        email: process.env.COMMUNITY_ENVIRONMENTAL_LEAD_EMAIL,
        password: process.env.COMMUNITY_ENVIRONMENTAL_LEAD_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Arts & Culture',
        email: process.env.COMMUNITY_ARTS_CULTURE_EMAIL,
        password: process.env.COMMUNITY_ARTS_CULTURE_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Sports Coordinator',
        email: process.env.COMMUNITY_SPORTS_COORDINATOR_EMAIL,
        password: process.env.COMMUNITY_SPORTS_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Business Leader',
        email: process.env.COMMUNITY_BUSINESS_LEADER_EMAIL,
        password: process.env.COMMUNITY_BUSINESS_LEADER_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Religious Leader',
        email: process.env.COMMUNITY_RELIGIOUS_LEADER_EMAIL,
        password: process.env.COMMUNITY_RELIGIOUS_LEADER_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Social Worker',
        email: process.env.COMMUNITY_SOCIAL_WORKER_EMAIL,
        password: process.env.COMMUNITY_SOCIAL_WORKER_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Tech Coordinator',
        email: process.env.COMMUNITY_TECH_COORDINATOR_EMAIL,
        password: process.env.COMMUNITY_TECH_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
       
    },
    {
        name: 'Community Volunteer Coordinator',
        email: process.env.COMMUNITY_VOLUNTEER_COORDINATOR_EMAIL,
        password: process.env.COMMUNITY_VOLUNTEER_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    },
    {
        name: 'Community Senior Coordinator',
        email: process.env.COMMUNITY_SENIOR_COORDINATOR_EMAIL,
        password: process.env.COMMUNITY_SENIOR_COORDINATOR_PASSWORD,
        role: 'community',
        isVerified: true,
    }
];

// Function to update existing community roles
const updateCommunityRoles = async () => {
    try {
        console.log('Starting community roles update...');

        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const updatedUsers = [];
        
        for (const roleConfig of communityRoles) {
            try {
                // Hash password
                const hashedPassword = await bcrypt.hash(roleConfig.password, saltRounds);
                
                // Update existing user by email OR find by role and update
                const user = await User.findOneAndUpdate(
                    { 
                        $or: [
                            { email: roleConfig.email },
                            { role: roleConfig.role }
                        ]
                    },
                    {
                        name: roleConfig.name,
                        email: roleConfig.email,
                        password: hashedPassword,
                        role: roleConfig.role,
                        isVerified: roleConfig.isVerified,
                    },
                    { 
                        new: true, // Return updated document
                        upsert: true, // Create if doesn't exist
                        setDefaultsOnInsert: true 
                    }
                );
                
                updatedUsers.push(user);
                console.log(`✅ Updated ${roleConfig.role}: ${roleConfig.email}`);
                
            } catch (error) {
                console.error(`❌ Error updating ${roleConfig.role}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Successfully updated ${updatedUsers.length} community roles!`);
        console.log('\n📋 Updated Users:');
        updatedUsers.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - ${user.role}`);
        });
        
    } catch (error) {
        console.error('Error updating community roles:', error);
    } finally {
        mongoose.connection.close();
    }
};

// Function to update only specific roles (for targeted updates)
const updateSpecificRole = async (roleType, newEmail, newPassword) => {
    try {
        console.log(`Updating specific role: ${roleType}...`);
        
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        const user = await User.findOneAndUpdate(
            { role: roleType },
            {
                email: newEmail,
                password: hashedPassword,
            },
            { new: true }
        );
        
        if (user) {
            console.log(`✅ Updated ${roleType}: ${newEmail}`);
        } else {
            console.log(`❌ Role ${roleType} not found`);
        }
        
    } catch (error) {
        console.error(`❌ Error updating ${roleType}:`, error.message);
    }
};

// Run the update script
const runUpdate = async () => {
    await connectDB();
    
    // Check command line arguments for specific update
    const args = process.argv.slice(2);
    if (args.length >= 3) {
        // Usage: node updateCommunityRoles.js community-senior-coordinator new@email.com newPassword
        const [roleType, newEmail, newPassword] = args;
        await updateSpecificRole(roleType, newEmail, newPassword);
    } else {
        // Update all roles
        await updateCommunityRoles();
    }
};

// Handle command line execution
if (require.main === module) {
    runUpdate().catch(console.error);
}

module.exports = { updateCommunityRoles, updateSpecificRole };