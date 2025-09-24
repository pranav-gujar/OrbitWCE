const { Schema, model } = require('mongoose');

const roles = [
    'user', 
    'community-youth-coordinator', 
    'community-education-leader', 
    'community-health-advocate', 
    'community-environmental-lead', 
    'community-arts-culture', 
    'community-sports-coordinator', 
    'community-business-leader', 
    'community-religious-leader', 
    'community-social-worker', 
    'community-tech-coordinator', 
    'community-volunteer-coordinator', 
    'community-senior-coordinator',
    'community',
    'admin', 
    'superadmin'
];

const TeamMemberSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: ''
    },
    photo: {
        type: String,
        default: ''
    },
    socialLinks: {
        linkedin: {
            type: String,
            default: ''
        },
        github: {
            type: String,
            default: ''
        },
        twitter: {
            type: String,
            default: ''
        },
        website: {
            type: String,
            default: ''
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: roles,
        default: 'user'
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    verificationToken: {
        type: String
    },

    emailOtp: String,
    emailOtpExpires: Date,
    passwordResetOtp: String,
    passwordResetOtpExpires: Date,
    
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    
    // Community-specific fields
    communityName: {
        type: String,
        default: ''
    },
    
    // Profile fields for all users
    photo: {
        type: String,
        default: ''
    },
    
    bio: {
        type: String,
        default: ''
    },
    
    // User specific fields
    phone: {
        type: String,
        default: ''
    },
    
    address: {
        type: String,
        default: ''
    },
    
    dateOfBirth: {
        type: Date,
        default: null
    },
    
    // Social links
    socialLinks: {
        linkedin: {
            type: String,
            default: ''
        },
        portfolio: {
            type: String,
            default: ''
        },
        github: {
            type: String,
            default: ''
        },
        twitter: {
            type: String,
            default: ''
        }
    },
    
    // Skills/interests
    skills: [{
        type: String
    }],
    
    // Liked events
    likedEvents: [{
        type: Schema.Types.ObjectId,
        ref: 'Event'
    }],
    
    // Community specific fields (only used when role is 'community')
    motto: {
        type: String,
        default: ''
    },
    
    teamMembers: {
        type: [TeamMemberSchema],
        default: []
    },
    
    website: {
        type: String,
        default: ''
    }

}, { timestamps: true });

// Add a method to check user roles
UserSchema.methods.hasRole = function(role) {
    return this.role === role;
};

// Add a method to check if user has any of the given roles
UserSchema.methods.hasAnyRole = function(roles) {
    return roles.includes(this.role);
};

// Pre-save hook to ensure role is valid
UserSchema.pre('save', function(next) {
    console.log('Pre-save - Current role:', this.role);
    console.log('Pre-save - isModified(role):', this.isModified('role'));
    
    // If role is not set or invalid, default to 'user'
    if (!this.role || !roles.includes(this.role)) {
        console.log(`Invalid role '${this.role}' detected, defaulting to 'user'`);
        this.role = 'user';
    }
    
    console.log('Pre-save - Final role:', this.role);
    next();
});

// Export the model
const User = model('User', UserSchema);
module.exports = User;