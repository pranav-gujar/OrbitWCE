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

// 17 Community Role configurations with specific role types
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