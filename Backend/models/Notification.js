const { Schema, model } = require('mongoose');

const NotificationSchema = new Schema({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['event_approved', 'event_rejected', 'new_event'],
        required: true
    },
    relatedEvent: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: false
    },
    isRead: {
        type: Boolean,
        default: false
    },
    rejectionReason: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = model('Notification', NotificationSchema);