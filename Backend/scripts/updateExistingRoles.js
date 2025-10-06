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
        findBy: { name: 'Rotaract Club Of WCE Sangli' },
        update: {
            name: 'Rotaract Club Of WCE Sangli',
            email: process.env.ROTARACT_COORDINATOR_EMAIL,
            password: await bcrypt.hash(process.env.ROTARACT_COORDINATOR_PASSWORD, saltRounds),
        }
    },
    {
        findBy: { name: 'Personality Advancement Circle of Engineers(PACE)' },
        update: {
            name: 'Personality Advancement Circle of Engineers(PACE)',
            email: process.env.PACE_COORDINATOR_EMAIL,
            password: await bcrypt.hash(process.env.PACE_COORDINATOR_PASSWORD, saltRounds),
        }
    },
    {
        findBy: { name: 'Google Developer Groups(GDG WCE)' },
        update: {
            name: 'Google Developer Groups(GDG WCE)',
            email: process.env.GDG_COORDINATOR_EMAIL,
            password: await bcrypt.hash(process.env.GDG_COORDINATOR_PASSWORD, saltRounds),
        }
    },
    {
        findBy: { name: 'ACM WCE Chapter' },
        update: {
            name: 'ACM WCE Chapter',
            email: process.env.ACM_COORDINATOR_EMAIL,
            password: await bcrypt.hash(process.env.ACM_COORDINATOR_PASSWORD, saltRounds),
        }
    },
    {
        findBy: { name: 'Art Circle' },
        update: {
            name: 'Art Circle',
            email: process.env.ART_COORDINATOR_EMAIL,
            password: await bcrypt.hash(process.env.ART_COORDINATOR_PASSWORD, saltRounds),
        }
    },
    {
        findBy: { name: 'Microsoft Learn Students Club(WCE MLSC)' },
        update: {
            name: 'Microsoft Learn Students Club(WCE MLSC)',
            email: process.env.MLSC_COORDINATOR_EMAIL,
            password: await bcrypt.hash(process.env.MLSC_COORDINATOR_PASSWORD, saltRounds),
        }
    },
    {
        findBy: { name: 'Walchand Linux User Group(WLUG)' },
        update: {
            name: 'Walchand Linux User Group(WLUG)',
            email: process.env.WLUG_COORDINATOR_EMAIL,
            password: await bcrypt.hash(process.env.WLUG_COORDINATOR_PASSWORD, saltRounds),
        }
    },
    {
        findBy: { name: 'ACSES Coordinator' },
        update: {
            name: 'ACSES Coordinator',
            email: process.env.ACSES_COORDINATOR_EMAIL,
            password: await bcrypt.hash(process.env.ACSES_COORDINATOR_PASSWORD, saltRounds),
        }
    },
    {
        findBy: { name: 'Electrical Engineering Students Association(EESA)' },
        update: {
            name: 'Electrical Engineering Students Association(EESA)',
            email: process.env.EESA_COORDINATOR_EMAIL,
            password: await bcrypt.hash(process.env.EESA_COORDINATOR_PASSWORD, saltRounds),
        }
    },
    {
        findBy: { name: 'Electronics Engineering Students Association(ELESA)' },
        update: {
            name: 'Electronics Engineering Students Association(ELESA)',
            email: process.env.ELESA_COORDINATOR_EMAIL,
            password: await bcrypt.hash(process.env.ELESA_COORDINATOR_PASSWORD, saltRounds),
        }
    },
    {
        findBy: { name: 'Civil Engineering Students Association(CESA)' },
        update: {
            name: 'Civil Engineering Students Association(CESA)',
            email: process.env.CESA_COORDINATOR_EMAIL,
            password: await bcrypt.hash(process.env.CESA_COORDINATOR_PASSWORD, saltRounds),
        }
    },
    {
        findBy: { name: 'Students Association of Information technology(SAIT)' },
        update: {
            name: 'Students Association of Information technology(SAIT)',
            email: process.env.SAIT_COORDINATOR_EMAIL,
            password: await bcrypt.hash(process.env.SAIT_COORDINATOR_PASSWORD, saltRounds),
        }
    },
    {
        findBy: { name: 'Mechanical Engineering Students Association(MESA)' },
        update: {
            name: 'Mechanical Engineering Students Association(MESA)',
            email: process.env.MESA_COORDINATOR_EMAIL,
            password: await bcrypt.hash(process.env.MESA_COORDINATOR_PASSWORD, saltRounds),
        }
    },
    {
        findBy: { name: 'Association of Students for Theoretical Reasoning in AI(ASTRA)' },
        update: {
            name: 'Association of Students for Theoretical Reasoning in AI(ASTRA)',
            email: process.env.ASTRA_COORDINATOR_EMAIL,
            password: await bcrypt.hash(process.env.ASTRA_COORDINATOR_PASSWORD, saltRounds),
        }
    },
    {
        findBy: { name: 'Student Organization For Technical Activities(SOFTA)' },
        update: {
            name: 'Student Organization For Technical Activities(SOFTA)',
            email: process.env.SOFTA_COORDINATOR_EMAIL,
            password: await bcrypt.hash(process.env.SOFTA_COORDINATOR_PASSWORD, saltRounds),
        }
    },
    {
        findBy: { name: 'CodeChef WCE Chapter(CodeChef)' },
        update: {
            name: 'CodeChef WCE Chapter(CodeChef)',
            email: process.env.CODECHEF_COORDINATOR_EMAIL,
            password: await bcrypt.hash(process.env.CODECHEF_COORDINATOR_PASSWORD, saltRounds),
        }
    },
    {
        findBy: { name: 'Team Vulcan Robotics' },
        update: {
            name: 'Team Vulcan Robotics',
            email: process.env.VULCAN_COORDINATOR_EMAIL,
            password: await bcrypt.hash(process.env.VULCAN_COORDINATOR_PASSWORD, saltRounds),
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
