const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const sendEmail = async (to, subject, htmlContent) => {
    // Validate required environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Email configuration error: Missing required environment variables (EMAIL_USER or EMAIL_PASS)');
        throw new Error('Email service configuration error');
    }

    // Validate email parameters
    if (!to || !subject || !htmlContent) {
        console.error('Email validation error: Missing required parameters', { to, subject, hasHtml: !!htmlContent });
        throw new Error('Missing required email parameters');
    }

    let transporter;
    try {
        console.log('Creating email transporter...');
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            // Add connection timeout
            connectionTimeout: 10000, // 10 seconds
            // Add more debugging
            debug: true,
            logger: true
        });

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
        console.error('Email sending failed:', {
            error: error.message,
            stack: error.stack,
            to,
            subject: subject.substring(0, 50) + '...',
            hasHtml: !!htmlContent
        });
        throw new Error(`Failed to send email: ${error.message}`);
    } finally {
        // Close the transporter when done
        if (transporter) {
            transporter.close();
        }
    }
};

module.exports = sendEmail;
