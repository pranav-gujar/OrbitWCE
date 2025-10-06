# Community Roles Database Storage Guide  

This guide explains how to store and manage the 17 club/community roles in the database for **OrbitWCE** — the Community & Event Management System for Walchand College of Engineering, Sangli.  

---

## Overview  

OrbitWCE supports **17 distinct college clubs and technical communities**, each having its own coordinator account for managing events, members, and reports.  
These roles are stored in the MongoDB database as part of the **User model**.

---

## 17 Community Roles  

1. **Rotaract Club Of WCE Sangli**  
2. **Personality Advancement Circle of Engineers (PACE)**  
3. **Google Developer Groups (GDG WCE)**  
4. **ACM WCE Chapter**  
5. **Art Circle**  
6. **Microsoft Learn Students Club (WCE MLSC)**  
7. **Walchand Linux User Group (WLUG)**  
8. **ACSES Coordinator**  
9. **Electrical Engineering Students Association (EESA)**  
10. **Electronics Engineering Students Association (ELESA)**  
11. **Civil Engineering Students Association (CESA)**  
12. **Students Association of Information Technology (SAIT)**  
13. **Mechanical Engineering Students Association (MESA)**  
14. **Association of Students for Theoretical Reasoning in AI (ASTRA)**  
15. **Student Organization For Technical Activities (SOFTA)**  
16. **CodeChef WCE Chapter (CodeChef)**  
17. **Team Vulcan Robotics**

---

## Database Schema  

### User Model Structure  

```javascript
{
  name: String,           // Full club/community name
  email: String,          // Club coordinator email
  password: String,       // Hashed password
  role: String,           // Always 'community' for clubs
  isVerified: Boolean,    // True after verification
  
  // Club-specific info
  bio: String,            // About the club
  motto: String,          // Club tagline or motto
  website: String,        // Club website or page link
  phone: String,          // Coordinator contact number
  address: String,        // WCE campus location
  
  // Optional fields
  teamMembers: [{
    name: String,
    role: String,
    bio: String
  }],
  socialLinks: {
    linkedin: String,
    instagram: String,
    github: String,
    youtube: String
  }
}


## How to Store Community Roles

### Method 1: Automatic Seeding (Recommended)

Run the automated seeding script to create all 17 club coordinator accounts:

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
This command automatically creates all 17 club roles using credentials stored in .env.


### Method 2: Manual Creation via API

You can also create community role users through the API endpoints:

#### Registration Endpoint
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Name",
  "email": "Email",
  "password": "Password",
  "role": "Role"
}
```

#### Using cURL
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Name",
    "email": "Email",
    "password": "Password",
    "role": "Role"
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
    name: 'Name',
    email: 'Email',
    password: hashedPassword,
    role: 'Role',
    isVerified: true,
    bio: 'Bio',
    motto: 'Motto',
    website: 'Website',
    phone: 'Phone',
    address: 'Address'
  });
  
  await user.save();
};
```

## Environment Variables

Ensure your `.env` file contains the community role and Super Admin credentials:

```bash
# Community Role Credentials
COMMUNITY_EMAIL=Email
COMMUNITY_PASSWORD=Password
# ... (continue for all)
```

## Database Operations

### Checking Stored Roles
```javascript
// Find all community role users
const communityUsers = await User.find({ role: 'community' });
```

### Updating Roles
```javascript
// Update user role
await User.findOneAndUpdate(
  { email: 'Email' },
  { motto: 'Motto' }
);
```

### Deleting Roles
```javascript
// Delete specific community role user
await User.deleteOne({ email: 'oldclub@wce.ac.in' });
```

## Validation Rules

- **Email**: Must be unique for each club
- **Role**: Must be 'community'
- **Password**: Will be auto-hashed
- **Club bio & motto**: Optional but recommended

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
       "email": "Email",
       "password": "Password"
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