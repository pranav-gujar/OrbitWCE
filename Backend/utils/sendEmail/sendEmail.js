const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const sendEmail = async (to, subject, htmlContent) => {
    console.log('Starting email sending process...');
    console.log('Environment variables:', {
        EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
        NODE_ENV: process.env.NODE_ENV || 'development'
    });

    // Validate required environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        const error = new Error('Email configuration error: Missing required environment variables (EMAIL_USER or EMAIL_PASS)');
        console.error(error.message);
        console.error('Current environment variables:', Object.keys(process.env));
        throw error;
    }

    // Validate email parameters
    if (!to || !subject || !htmlContent) {
        console.error('Email validation error: Missing required parameters', { to, subject, hasHtml: !!htmlContent });
        throw new Error('Missing required email parameters');
    }

    let transporter;
    try {
        console.log('Creating email transporter...');
        const transporterConfig = {
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            // Add connection timeout
            connectionTimeout: 15000, // 15 seconds
            // Add more debugging
            debug: true,
            logger: (log) => console.log('Nodemailer:', log.message || log)
        };
        
        console.log('Transporter config:', {
            ...transporterConfig,
            auth: { ...transporterConfig.auth, pass: '***' } // Don't log actual password
        });
        
        transporter = nodemailer.createTransport(transporterConfig);

        // Verify connection configuration
        await transporter.verify();
        console.log('Server is ready to take our messages');
        
        console.log(`Sending email to: ${to}`);
        console.log(`Subject: ${subject}`);
        
        const mailOptions = {
            from: `"PGT Global Networks" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
            // Add text version for better deliverability
            text: htmlContent.replace(/<[^>]*>?/gm, '') // Basic HTML to text conversion
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
        
    } catch (error) {
        const errorDetails = {
            error: error.message,
            code: error.code,
            stack: error.stack,
            to,
            subject: subject.substring(0, 50) + '...',
            hasHtml: !!htmlContent,
            environment: process.env.NODE_ENV || 'development'
        };
        
        console.error('Email sending failed with details:', JSON.stringify(errorDetails, null, 2));
        
        if (error.response) {
            console.error('SMTP Error Response:', error.response);
        }
        
        // Throw a more descriptive error
        const enhancedError = new Error(`Failed to send email: ${error.message}`);
        enhancedError.details = errorDetails;
        throw enhancedError;
    } finally {
        // Close the transporter when done
        if (transporter) {
            transporter.close();
        }
    }
};

module.exports = sendEmail;
