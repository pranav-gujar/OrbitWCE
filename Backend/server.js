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
// Allowed origins
const allowedOrigins = [
    'http://localhost:5173',
    'https://event-management-system-roan-five.vercel.app'
];

const io = new Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl, etc.)
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.indexOf(origin) === -1) {
                const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true
    },
    // Enable debugging
    path: '/socket.io/'
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
const corsOptions = {
    origin: ['http://localhost:5173','https://event-management-system-roan-five.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(cookieParser());


// APPLICATION ROUTES 
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const eventRouter = require('./routes/eventRoutes');
const notificationRouter = require('./routes/notificationRoutes');
const reportRouter = require('./routes/reportRoutes');
const uploadRouter = require('./routes/uploadRoutes');

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

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