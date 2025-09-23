const { Schema, model } = require('mongoose');

const PhotoSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        default: ''
    }
});

const ReportSchema = new Schema({
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    highlights: {
        type: String,
        default: ''
    },
    feedback: {
        type: String,
        default: ''
    },
    photos: [PhotoSchema],
    isSubmitted: {
        type: Boolean,
        default: false
    },
    submittedAt: {
        type: Date,
        default: null
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Auto-generated report data
    eventDetails: {
        title: String,
        date: Date,
        location: String,
        description: String,
        category: String,
        
        subEvents: [{
            name: String,
            date: Date,
            venue: String,
            description: String,
            totalRegistered: Number,
            participants: [{
                name: String,
                email: String,
                phone: String,
                instituteName: String,
                registeredAt: Date
            }],
            fee: Number,
            prize: String
        }]
    },
    participantData: {
        totalRegistered: {
            type: Number,
            default: 0
        },
        totalMainEventRegistrations: {
            type: Number,
            default: 0
        },
        totalSubEventRegistrations: {
            type: Number,
            default: 0
        },
        totalAttended: {
            type: Number,
            default: 0
        },
        participants: [{
            name: String,
            email: String,
            phone: String,
            instituteName: String,
            role: String,
            subEvent: String,
            registeredAt: Date
        }]
    },
    notes: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'reviewed'],
        default: 'draft'
    },
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    reviewComments: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = model('Report', ReportSchema);