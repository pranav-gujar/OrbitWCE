const { Schema, model } = require('mongoose');

const RegistrationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    instituteName: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    registeredAt: {
        type: Date,
        default: Date.now
    }
});

const SubEventSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    rules: {
        type: String,
        default: ''
    },
    coordinators: [{
        name: String,
        contact: String
    }],
    fee: {
        type: Number,
        default: 0
    },
    prize: {
        type: String,
        default: ''
    },
    registrations: [RegistrationSchema]
});

const EventSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        required: true
    },
    coordinators: [{
        name: String,
        contact: String
    }],
    links: [{
        title: String,
        url: String
    }],
    subEvents: [SubEventSchema],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending'
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attendees: {
        type: Number,
        default: 0
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    deletionRequested: {
        type: Boolean,
        default: false
    },
    deletionReason: {
        type: String,
        default: ''
    },
    registrations: [RegistrationSchema]
}, { timestamps: true });

module.exports = model('Event', EventSchema);