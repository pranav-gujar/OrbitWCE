import { io } from 'socket.io-client';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

console.log('Initializing socket connection to:', baseURL);

const socket = io(baseURL, {
  transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
  reconnectionAttempts: 10, // Try to reconnect 10 times
  reconnectionDelay: 1000, // Start with 1s delay
  reconnectionDelayMax: 5000, // Maximum 5s delay
  timeout: 20000, // Increase connection timeout
  auth: {
    token: localStorage.getItem('token')
  },
  autoConnect: false // We'll connect manually after setting up listeners
});

// Debug connection events
socket.on('connect', () => {
  console.log('🔌 Socket connected with ID:', socket.id);
  // Authenticate with the server if user is logged in
  const token = localStorage.getItem('token');
  console.log('🔑 Authentication token found:', !!token);
  
  if (token) {
    try {
      // Extract user ID from JWT token (this is a simplified example)
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('👤 Extracted user ID from token:', payload?.userId);
      
      if (payload && payload.userId) {
        console.log('📡 Emitting authenticate event for user:', payload.userId);
        socket.emit('authenticate', payload.userId);
      }
    } catch (error) {
      console.error('❌ Error parsing token:', error);
    }
  }
});

// Log all incoming events for debugging
const originalOn = socket.on;
socket.on = function(event, callback) {
  console.log(`👂 Listening for event: ${event}`);
  return originalOn.call(this, event, (...args) => {
    console.log(`📨 Received event '${event}':`, ...args);
    return callback(...args);
  });
};

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);  
  // Try to reconnect after a delay
  setTimeout(() => {
    console.log('Attempting to reconnect...');
    socket.connect();
  }, 1000);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error.message);
  console.error('Error details:', {
    type: error.type,
    description: error.description,
    message: error.message,
    stack: error.stack
  });
  
  // Check if token might be invalid
  if (error.message.includes('auth') || error.message.includes('jwt')) {
    console.warn('Authentication error detected. Token might be invalid.');
    // Consider refreshing the token or redirecting to login
  }
  
  // Try to reconnect with exponential backoff
  const reconnectDelay = Math.min(5000 * (socket.reconnectAttempts || 1), 30000);
  socket.reconnectAttempts = (socket.reconnectAttempts || 0) + 1;
  
  console.log(`Attempting to reconnect after error... (Attempt ${socket.reconnectAttempts}, delay: ${reconnectDelay}ms)`);
  
  setTimeout(() => {
    // Try with polling if websocket failed multiple times
    if (socket.reconnectAttempts > 3) {
      console.log('Switching to polling transport after multiple websocket failures');
      socket.io.opts.transports = ['polling', 'websocket'];
    }
    
    socket.connect();
  }, reconnectDelay);
});

// Connect the socket
socket.connect();

export default socket;
