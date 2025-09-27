const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const database = require('./config/database');



dotenv.config();
const app = express();
// create HTTP server for socket.io
const httpServer = http.createServer(app);

// Initialize socket.io
const io = new Server(httpServer, {
    cors: {
        origin: [
            'http://localhost:5173',
            'https://event-management-system-roan-five.vercel.app',
            'https://event-management-system-8p2k.onrender.com'
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    },
    // Enable debugging
    path: '/socket.io',
    // Add these options for better WebSocket support
    transports: ['websocket', 'polling'],
    allowUpgrades: true,
    pingTimeout: 30000,
    pingInterval: 25000
});

// Make io accessible in routes/controllers via req.app.get('io')
app.set('io', io);

// Debug socket connections
io.on('connection', (socket) => {
    console.log('🔌 Socket client connected:', socket.id);
    
    // When a user authenticates, add them to their personal room
    socket.on('authenticate', (userId) => {
        if (userId) {
            socket.join(`user_${userId}`);
            console.log(`👤 User ${userId} joined room user_${userId}`);
        }
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Socket client disconnected:', socket.id);
    });

    // Log all events for debugging
    const originalEmit = socket.emit;
    socket.emit = function(event, ...args) {
        console.log(`📤 Emitting event '${event}' to socket ${socket.id}:`, args[0] || 'No data');
        return originalEmit.apply(this, [event, ...args]);
    };
});


// MIDDLEWARE  
app.use(express.json({ limit: '50mb' }));

// CORS configuration with credentials support
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://event-management-system-roan-five.vercel.app',
        'https://event-management-system-8p2k.onrender.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200 // For legacy browser support
}));

// Handle preflight requests
app.options('*', cors());

app.use(cookieParser());


// APPLICATION ROUTES 
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const eventRouter = require('./routes/eventRoutes');
const notificationRouter = require('./routes/notificationRoutes');
const reportRouter = require('./routes/reportRoutes');
const uploadRouter = require('./routes/uploadRoutes');
const sendEmail = require('./utils/sendEmail/sendEmail');
const logger = require('./utils/logger');

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Test email endpoint
app.get('/api/test-email', async (req, res) => {
    try {
        const testEmail = process.env.TEST_EMAIL || 'your-email@example.com';
        logger.info('Sending test email to:', testEmail);
        
        const result = await sendEmail(
            testEmail,
            'Test Email from PGT Global Networks',
            '<h1>Test Email</h1><p>This is a test email from PGT Global Networks.</p>'
        );
        
        res.status(200).json({
            success: true,
            message: 'Test email sent successfully',
            details: result
        });
    } catch (error) {
        logger.error('Test email failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error.message,
            details: error.details || {}
        });
    }
});

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/events', eventRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/reports', reportRouter);
app.use('/api/users', uploadRouter);  // Mount upload routes under /api/users



// LISTENING 
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, async() => {
    console.log(`Server running on port ${PORT}`);
    await database();
})