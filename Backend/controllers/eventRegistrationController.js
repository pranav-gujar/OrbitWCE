const Event = require('../models/Event');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail/sendEmail');

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Public (anyone can register)
exports.registerForEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const { 
            name, 
            email, 
            phone, 
            instituteName, 
            degree, 
            branch, 
            year, 
            transactionId,
            subEventId // Optional, if registering for a sub-event
        } = req.body;

        console.log('Received registration data:', req.body);
        console.log('Event ID:', eventId);

        // Find the event
        let event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if event is approved
        if (event.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Cannot register for an event that is not approved'
            });
        }

        // Create registration object
        const registration = {
            name,
            email,
            phone,
            instituteName,
            degree,
            branch,
            year,
            transactionId,
            registeredAt: new Date()
        };

        // If registering for a sub-event, add to that sub-event's registrations
        if (subEventId) {
            const subEventIndex = event.subEvents.findIndex(se => se._id.toString() === subEventId);
            if (subEventIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Sub-event not found'
                });
            }

            // Add registration to sub-event using direct MongoDB update
            console.log('Adding registration to sub-event:', subEventId);
            console.log('Registration data:', registration);
            
            // Use direct MongoDB update for sub-event registration
            await Event.updateOne(
                { _id: eventId, 'subEvents._id': subEventId },
                { 
                    $push: { 'subEvents.$.registrations': registration },
                    $inc: { attendees: 1 }
                }
            );
            
            // Refresh event data from database
            event = await Event.findById(eventId);
        } else {
            // Add registration to main event using direct MongoDB update
            console.log('Adding registration to main event');
            console.log('Registration data:', registration);
            
            // Use direct MongoDB update for main event registration
            await Event.updateOne(
                { _id: eventId },
                { 
                    $push: { registrations: registration },
                    $inc: { attendees: 1 }
                }
            );
            
            // Refresh event data from database
            event = await Event.findById(eventId);
        }
        
        console.log('Registration added to event:', {
            eventId: event._id,
            registrationsCount: event.registrations ? event.registrations.length : 0,
            subEventsRegistrations: event.subEvents ? event.subEvents.map(se => ({ 
                id: se._id, 
                registrationsCount: se.registrations ? se.registrations.length : 0 
            })) : []
        });
        
        try {
            // Since we've already updated the database directly, we just need to log the verification
            console.log('Registration saved in:', subEventId ? 'subEvent registrations' : 'main event registrations');
            
            // Log the full event object structure to debug
            console.log('UPDATED EVENT STRUCTURE:', JSON.stringify({
                _id: event._id,
                title: event.title,
                hasRegistrationsArray: Array.isArray(event.registrations),
                registrationsCount: event.registrations ? event.registrations.length : 0,
                hasSubEvents: Array.isArray(event.subEvents),
                subEventsCount: event.subEvents ? event.subEvents.length : 0,
                subEventsWithRegistrations: event.subEvents ? 
                    event.subEvents.map(se => ({
                        _id: se._id,
                        name: se.name,
                        hasRegistrationsArray: Array.isArray(se.registrations),
                        registrationsCount: se.registrations ? se.registrations.length : 0
                    })) : []
            }, null, 2));
                
            // Double-check by querying the database directly with lean() for raw object
            const verifiedEvent = await Event.findById(eventId).lean();
            console.log('VERIFIED EVENT FROM DATABASE:', JSON.stringify({
                _id: verifiedEvent._id,
                title: verifiedEvent.title,
                hasRegistrationsArray: Array.isArray(verifiedEvent.registrations),
                registrationsCount: verifiedEvent.registrations ? verifiedEvent.registrations.length : 0,
                hasSubEvents: Array.isArray(verifiedEvent.subEvents),
                subEventsCount: verifiedEvent.subEvents ? verifiedEvent.subEvents.length : 0,
                subEventsWithRegistrations: verifiedEvent.subEvents ? 
                    verifiedEvent.subEvents.map(se => ({
                        _id: se._id,
                        name: se.name,
                        hasRegistrationsArray: Array.isArray(se.registrations),
                        registrationsCount: se.registrations ? se.registrations.length : 0
                    })) : []
            }, null, 2));
        } catch (error) {
            console.error('Error verifying registration:', error);
            throw error;
        }

        // Generate Google Calendar link
        const eventDate = new Date(subEventId ? 
            event.subEvents.find(se => se._id.toString() === subEventId).date : 
            event.date);
        const eventTitle = encodeURIComponent(subEventId ? 
            event.subEvents.find(se => se._id.toString() === subEventId).name : 
            event.title);
        const eventLocation = encodeURIComponent(subEventId ? 
            event.subEvents.find(se => se._id.toString() === subEventId).venue : 
            event.location);
        const eventDescription = encodeURIComponent(`You've registered for ${subEventId ? 
            event.subEvents.find(se => se._id.toString() === subEventId).name : 
            event.title}`);
        
        const startDate = eventDate.toISOString().replace(/-|:|\.\d+/g, '');
        const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, '');
        
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startDate}/${endDate}&details=${eventDescription}&location=${eventLocation}`;

        // Send confirmation email
        const emailContent = `
            <h2>Registration Confirmation</h2>
            <p>Thank you for registering for ${subEventId ? 
                event.subEvents.find(se => se._id.toString() === subEventId).name : 
                event.title}!</p>
            <p><strong>Event Details:</strong></p>
            <ul>
                <li><strong>Event:</strong> ${subEventId ? 
                    event.subEvents.find(se => se._id.toString() === subEventId).name : 
                    event.title}</li>
                <li><strong>Date:</strong> ${new Date(subEventId ? 
                    event.subEvents.find(se => se._id.toString() === subEventId).date : 
                    event.date).toLocaleString()}</li>
                <li><strong>Location:</strong> ${subEventId ? 
                    event.subEvents.find(se => se._id.toString() === subEventId).venue : 
                    event.location}</li>
            </ul>
            <p>Your registration has been confirmed. We look forward to seeing you at the event!</p>
            <p><a href="${calendarUrl}" target="_blank">Add to Google Calendar</a></p>
        `;

        await sendEmail(email, `Registration Confirmation: ${subEventId ? 
            event.subEvents.find(se => se._id.toString() === subEventId).name : 
            event.title}`, emailContent);

        res.status(200).json({
            success: true,
            message: 'Registration successful',
            data: {
                registration,
                calendarUrl
            }
        });
    } catch (error) {
        console.error('Error registering for event:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get all registrations for an event
// @route   GET /api/events/:id/registrations
// @access  Private (event creator or admin only)
exports.getEventRegistrations = async (req, res) => {
    try {
        const eventId = req.params.id;
        const { subEventId } = req.query;

        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is authorized (event creator or admin)
        if (event.creator.toString() !== req.user.id && req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view registrations'
            });
        }

        let registrations;
        if (subEventId) {
            // Get registrations for a specific sub-event
            const subEvent = event.subEvents.find(se => se._id.toString() === subEventId);
            if (!subEvent) {
                return res.status(404).json({
                    success: false,
                    message: 'Sub-event not found'
                });
            }
            registrations = subEvent.registrations || [];
        } else {
            // Get registrations for the main event
            registrations = event.registrations || [];
        }

        res.status(200).json({
            success: true,
            count: registrations.length,
            data: registrations
        });
    } catch (error) {
        console.error('Error getting event registrations:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};