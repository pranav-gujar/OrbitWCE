const emailQueue = require('../emailQueue');
const logger = require('../logger');

/**
 * Sends an email using the email queue system
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of the email
 * @returns {Promise<Object>} - Information about the queued email
 */
const sendEmail = async (to, subject, htmlContent) => {
    try {
        logger.info('Queueing email', { to, subject });
        
        const emailData = {
            to,
            subject,
            html: htmlContent
        };

        // Add email to queue and return immediately
        const queuedEmail = await emailQueue.addToQueue(emailData);
        
        logger.info('Email queued successfully', {
            to,
            queuePosition: emailQueue.queue.length,
            emailId: queuedEmail.id
        });

        return {
            success: true,
            message: 'Email queued for sending',
            emailId: queuedEmail.id,
            queuePosition: emailQueue.queue.length
        };
    } catch (error) {
        logger.error('Failed to queue email', {
            to,
            error: error.message,
            stack: error.stack
        });
        
        // Return error without throwing to prevent registration failures
        return {
            success: false,
            message: 'Failed to queue email',
            error: error.message
        };
    }
};

module.exports = sendEmail;
