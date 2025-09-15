# Community Roles Database Storage Guide

This guide explains how to store and manage the 12 community roles in the database for the Event Management System.

## Overview

The system supports 12 distinct community roles, each with specific permissions and capabilities. These roles are stored in the MongoDB database as part of the User model.

## 12 Community Roles

1. **Community Youth Coordinator** - `community-youth-coordinator`
2. **Community Education Leader** - `community-education-leader`
3. **Community Health Advocate** - `community-health-advocate`
4. **Community Environmental Lead** - `community-environmental-lead`
5. **Community Arts & Culture** - `community-arts-culture`
6. **Community Sports Coordinator** - `community-sports-coordinator`
7. **Community Business Leader** - `community-business-leader`
8. **Community Religious Leader** - `community-religious-leader`
9. **Community Social Worker** - `community-social-worker`
10. **Community Tech Coordinator** - `community-tech-coordinator`
11. **Community Volunteer Coordinator** - `community-volunteer-coordinator`
12. **Community Senior Coordinator** - `community-senior-coordinator`

## Database Schema

### User Model Structure

The User model includes the following fields for community roles:

```javascript
{
  name: String,           // Full name of the community leader
  email: String,         // Unique email address
  password: String,      // Hashed password
  role: String,          // One of the 12 community role types
  isVerified: Boolean,   // Email verification status
  
  // Community-specific fields
  bio: String,           // Community organization description
  motto: String,         // Organization motto/slogan
  website: String,       // Organization website
  phone: String,         // Contact phone number
  address: String,       // Physical address
  
  // Additional fields
  teamMembers: [{
    name: String,
    role: String,
    bio: String
  }],
  skills: [String],      // Areas of expertise
  socialLinks: {
    linkedin: String,
    portfolio: String,
    github: String,
    twitter: String
  }
}
```

## How to Store Community Roles

### Method 1: Automatic Seeding (Recommended)

Run the automated seeding script to create all 12 community role users:

```bash
# Navigate to the backend directory
cd Backend

# Install dependencies (if not already done)
npm install

# Run the community roles seeder
npm run seed:community

# Or run all seeders (SuperAdmin + Community Roles)
npm run seed:all
```

### Method 2: Manual Creation via API

You can also create community role users through the API endpoints:

#### Registration Endpoint
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Community Youth Coordinator",
  "email": "youth.coordinator@community.org",
  "password": "YouthCoord2024!",
  "role": "community-youth-coordinator"
}
```

#### Using cURL
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Community Youth Coordinator",
    "email": "youth.coordinator@community.org",
    "password": "YouthCoord2024!",
    "role": "community-youth-coordinator"
  }'
```

### Method 3: Direct Database Insertion

For development/testing, you can insert directly into MongoDB:

```javascript
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const createCommunityUser = async () => {
  const hashedPassword = await bcrypt.hash('YouthCoord2024!', 10);
  
  const user = new User({
    name: 'Community Youth Coordinator',
    email: 'youth.coordinator@community.org',
    password: hashedPassword,
    role: 'community-youth-coordinator',
    isVerified: true,
    bio: 'Dedicated to empowering youth in our community',
    motto: 'Empowering the next generation',
    website: 'https://youth.community.org',
    phone: '+1-555-YOUTH-01',
    address: '123 Youth Center Drive, Community City, CC 12345'
  });
  
  await user.save();
};
```

## Environment Variables

Ensure your `.env` file contains the community role credentials:

```bash
# 12 Community Role Credentials
COMMUNITY_YOUTH_COORDINATOR_EMAIL=youth.coordinator@community.org
COMMUNITY_YOUTH_COORDINATOR_PASSWORD=YouthCoord2024!
COMMUNITY_EDUCATION_LEADER_EMAIL=education.leader@community.org
COMMUNITY_EDUCATION_LEADER_PASSWORD=EduLead2024!
# ... (continue for all 12 roles)
```

## Database Operations

### Checking Stored Roles
```javascript
// Find all community role users
const communityUsers = await User.find({ 
  role: { $regex: /^community-/ } 
});

// Find specific role
const youthCoordinators = await User.find({ 
  role: 'community-youth-coordinator' 
});

// Count roles
const roleCounts = await User.aggregate([
  { $match: { role: { $regex: /^community-/ } } },
  { $group: { _id: "$role", count: { $sum: 1 } } }
]);
```

### Updating Roles
```javascript
// Update user role
await User.findOneAndUpdate(
  { email: 'user@example.com' },
  { role: 'community-health-advocate' }
);
```

### Deleting Roles
```javascript
// Delete specific community role user
await User.deleteOne({ email: 'old.coordinator@community.org' });

// Delete all community roles (use with caution)
await User.deleteMany({ role: { $regex: /^community-/ } });
```

## Validation Rules

- **Email**: Must be unique across all users
- **Role**: Must be one of the predefined 12 community role strings
- **Password**: Automatically hashed before storage
- **Phone**: Optional, stored as string
- **Website**: Must be valid URL format

## Testing the Setup

After seeding, test the setup:

1. **Verify users in database**:
   ```bash
   npm run seed:community
   ```

2. **Check MongoDB**:
   ```javascript
   // Connect to MongoDB
   mongo
   
   // Switch to database
   use event-management-system
   
   // Find community users
   db.users.find({role: {$regex: /^community-/}})
   ```

3. **Test login**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "youth.coordinator@community.org",
       "password": "YouthCoord2024!"
     }'
   ```

## Troubleshooting

### Common Issues

1. **Role not found**: Ensure the role string matches exactly
2. **Email already exists**: Use unique emails for each role
3. **Database connection**: Check MongoDB URI in .env
4. **Password hashing**: Ensure bcrypt is installed and working

### Reset Community Roles

To reset and re-seed all community roles:

```bash
# Clear existing community roles
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
mongoose.connect(process.env.MONGO_URI)
  .then(() => User.deleteMany({role: {\$regex: /^community-/}}))
  .then(() => console.log('Cleared community roles'))
  .then(() => mongoose.disconnect());
"

# Re-seed
npm run seed:community
```

## Next Steps

1. Run the seeding script
2. Verify users are created in database
3. Test authentication with community role credentials
4. Set up proper email verification for production
5. Configure additional community-specific features as needed