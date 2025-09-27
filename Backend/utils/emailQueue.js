const nodemailer = require('nodemailer');
const { EventEmitter } = require('events');
const logger = require('./logger');

class EmailQueue extends EventEmitter {
    constructor() {
        super();
        this.queue = [];
        this.isProcessing = false;
        this.retryAttempts = 3;
        this.retryDelay = 5000; // 5 seconds
        this.transporter = this.createTransporter();
    }

    createTransporter() {
        // Use SendGrid if SENDGRID_API_KEY is set, otherwise fall back to SMTP
        if (process.env.SENDGRID_API_KEY) {
            return nodemailer.createTransport({
                host: 'smtp.sendgrid.net',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: 'apikey', // This is literally the word 'apikey'
                    pass: process.env.SENDGRID_API_KEY
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
        }

        // Fall back to Gmail SMTP
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 1000,
            rateLimit: 5
        });
    }

    async addToQueue(emailData) {
        const emailWithMetadata = {
            ...emailData,
            attempts: 0,
            lastAttempt: null,
            status: 'queued'
        };
        
        this.queue.push(emailWithMetadata);
        this.processQueue();
        return emailWithMetadata;
    }

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const email = this.queue.shift();
            email.attempts++;
            email.lastAttempt = new Date();
            email.status = 'sending';

            try {
                await this.sendEmail(email);
                email.status = 'sent';
                this.emit('sent', email);
            } catch (error) {
                email.error = error.message;
                email.status = 'failed';
                
                if (email.attempts < this.retryAttempts) {
                    email.status = 'retrying';
                    this.queue.push(email);
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                } else {
                    this.emit('failed', email);
                }
            }
        }

        this.isProcessing = false;
    }

    async sendEmail({ to, subject, html }) {
        const mailOptions = {
            from: `"PGT Global Networks" <${process.env.EMAIL_USER || 'noreply@example.com'}>`,
            to,
            subject,
            html,
            text: html.replace(/<[^>]*>?/gm, ''),
            // Add headers to prevent emails from being marked as spam
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'high'
            }
        };

        logger.info('Attempting to send email', { to, subject });

        try {
            // Verify connection first
            await this.transporter.verify();
            logger.info('SMTP connection verified');
            
            const info = await this.transporter.sendMail(mailOptions);
            
            logger.info('Email sent successfully:', {
                to,
                messageId: info.messageId,
                response: info.response,
                envelope: info.envelope
            });
            
            return info;
        } catch (error) {
            const errorDetails = {
                to,
                error: error.message,
                code: error.code,
                stack: error.stack,
                response: error.response,
                command: error.command
            };
            
            logger.error('Email send error:', errorDetails);
            
            // If it's a connection error, try recreating the transporter
            if (error.code === 'ECONNECTION' || error.code === 'EAUTH') {
                logger.info('Recreating transporter due to connection/auth error');
                this.transporter = this.createTransporter();
            }
            
            throw error;
        }
    }
}

// Create a singleton instance
const emailQueue = new EmailQueue();

// Log queue events
emailQueue.on('sent', (email) => {
    logger.info(`Email sent to ${email.to} after ${email.attempts} attempts`);
});

emailQueue.on('failed', (email) => {
    logger.error(`Failed to send email to ${email.to} after ${email.attempts} attempts`, {
        error: email.error,
        lastAttempt: email.lastAttempt
    });
});

module.exports = emailQueue;
