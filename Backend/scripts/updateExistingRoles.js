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

// Function to update ONLY existing community roles
const updateExistingCommunityRoles = async () => {
    try {
        console.log('Searching for existing community roles to update...');

        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const updatedUsers = [];
        
        // Define the mapping for existing roles to update
        const roleUpdates = [
            {
                findBy: { name: 'Community Youth Coordinator' }, // Find by exact name
                update: {
                    name: 'Community Youth Coordinator',
                    email: process.env.COMMUNITY_YOUTH_COORDINATOR_EMAIL,
                    password: await bcrypt.hash(process.env.COMMUNITY_YOUTH_COORDINATOR_PASSWORD, saltRounds),
                }
            },
            {
                findBy: { name: 'Community Education Leader' },
                update: {
                    name: 'Community Education Leader',
                    email: process.env.COMMUNITY_EDUCATION_LEADER_EMAIL,
                    password: await bcrypt.hash(process.env.COMMUNITY_EDUCATION_LEADER_PASSWORD, saltRounds),
                }
            },
            {
                findBy: { name: 'Community Health Advocate' },
                update: {
                    name: 'Community Health Advocate',
                    email: process.env.COMMUNITY_HEALTH_ADVOCATE_EMAIL,
                    password: await bcrypt.hash(process.env.COMMUNITY_HEALTH_ADVOCATE_PASSWORD, saltRounds),
                }
            },
            {
                findBy: { name: 'Community Environmental Lead' },
                update: {
                    name: 'Community Environmental Lead',
                    email: process.env.COMMUNITY_ENVIRONMENTAL_LEAD_EMAIL,
                    password: await bcrypt.hash(process.env.COMMUNITY_ENVIRONMENTAL_LEAD_PASSWORD, saltRounds),
                }
            },
            {
                findBy: { name: 'Community Arts & Culture' },
                update: {
                    name: 'Community Arts & Culture',
                    email: process.env.COMMUNITY_ARTS_CULTURE_EMAIL,
                    password: await bcrypt.hash(process.env.COMMUNITY_ARTS_CULTURE_PASSWORD, saltRounds),
                }
            },
            {
                findBy: { name: 'Community Sports Coordinator' },
                update: {
                    name: 'Community Sports Coordinator',
                    email: process.env.COMMUNITY_SPORTS_COORDINATOR_EMAIL,
                    password: await bcrypt.hash(process.env.COMMUNITY_SPORTS_COORDINATOR_PASSWORD, saltRounds),
                }
            },
            {
                findBy: { name: 'Community Business Leader' },
                update: {
                    name: 'Community Business Leader',
                    email: process.env.COMMUNITY_BUSINESS_LEADER_EMAIL,
                    password: await bcrypt.hash(process.env.COMMUNITY_BUSINESS_LEADER_PASSWORD, saltRounds),
                }
            },
            {
                findBy: { name: 'Community Religious Leader' },
                update: {
                    name: 'Community Religious Leader',
                    email: process.env.COMMUNITY_RELIGIOUS_LEADER_EMAIL,
                    password: await bcrypt.hash(process.env.COMMUNITY_RELIGIOUS_LEADER_PASSWORD, saltRounds),
                }
            },
            {
                findBy: { name: 'Community Social Worker' },
                update: {
                    name: 'Community Social Worker',
                    email: process.env.COMMUNITY_SOCIAL_WORKER_EMAIL,
                    password: await bcrypt.hash(process.env.COMMUNITY_SOCIAL_WORKER_PASSWORD, saltRounds),
                }
            },
            {
                findBy: { name: 'Community Tech Coordinator' },
                update: {
                    name: 'Community Tech Coordinator',
                    email: process.env.COMMUNITY_TECH_COORDINATOR_EMAIL,
                    password: await bcrypt.hash(process.env.COMMUNITY_TECH_COORDINATOR_PASSWORD, saltRounds),
                }
            },
            {
                findBy: { name: 'Community Volunteer Coordinator' },
                update: {
                    name: 'Community Volunteer Coordinator',
                    email: process.env.COMMUNITY_VOLUNTEER_COORDINATOR_EMAIL,
                    password: await bcrypt.hash(process.env.COMMUNITY_VOLUNTEER_COORDINATOR_PASSWORD, saltRounds),
                }
            },
            {
                findBy: { name: 'Community Senior Coordinator' },
                update: {
                    name: 'Community Senior Coordinator',
                    email: process.env.COMMUNITY_SENIOR_COORDINATOR_EMAIL,
                    password: await bcrypt.hash(process.env.COMMUNITY_SENIOR_COORDINATOR_PASSWORD, saltRounds),
                }
            }
        ];

        // Update each existing role
        for (const roleUpdate of roleUpdates) {
            try {
                // Find existing user by name (exact match)
                const existingUser = await User.findOne(roleUpdate.findBy);
                
                if (existingUser) {
                    // Update the existing user
                    const updatedUser = await User.findOneAndUpdate(
                        { _id: existingUser._id }, // Find by existing user's ID
                        roleUpdate.update,
                        { new: true }
                    );
                    
                    updatedUsers.push(updatedUser);
                    console.log(`✅ Updated existing user: ${updatedUser.name} (${updatedUser.email})`);
                } else {
                    console.log(`⚠️  User not found: ${roleUpdate.findBy.name}`);
                }
                
            } catch (error) {
                console.error(`❌ Error updating ${roleUpdate.findBy.name}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Successfully updated ${updatedUsers.length} existing community roles!`);
        
        if (updatedUsers.length > 0) {
            console.log('\n📋 Updated Users:');
            updatedUsers.forEach(user => {
                console.log(`- ${user.name} (${user.email}) - ${user.role}`);
            });
        }
        
    } catch (error) {
        console.error('Error updating community roles:', error);
    } finally {
        mongoose.connection.close();
    }
};

// Function to update a specific role by name
const updateRoleByName = async (userName, newEmail, newPassword) => {
    try {
        console.log(`Updating specific role: ${userName}...`);
        
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        const updatedUser = await User.findOneAndUpdate(
            { name: userName },
            {
                email: newEmail,
                password: hashedPassword,
            },
            { new: true }
        );
        
        if (updatedUser) {
            console.log(`✅ Updated ${userName}: ${newEmail}`);
            return updatedUser;
        } else {
            console.log(`⚠️  User ${userName} not found`);
            return null;
        }
        
    } catch (error) {
        console.error(`❌ Error updating ${userName}:`, error.message);
    }
};

// Run the update script
const runUpdate = async () => {
    await connectDB();
    
    // Check command line arguments for specific update
    const args = process.argv.slice(2);
    if (args.length >= 3) {
        // Usage: node updateExistingRoles.js "Community Youth Coordinator" new@email.com newPassword
        const [userName, newEmail, newPassword] = args;
        await updateRoleByName(userName, newEmail, newPassword);
    } else {
        // Update all existing roles
        await updateExistingCommunityRoles();
    }
};

// Handle command line execution
if (require.main === module) {
    runUpdate().catch(console.error);
}

module.exports = { updateExistingCommunityRoles, updateRoleByName };