const jwt = require('jsonwebtoken');
require('dotenv').config();


const protect = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        let token = req.cookies?.token;
        
        if (!token && req.headers.authorization?.startsWith('Bearer ')) {
            // Extract token from Authorization header (format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            console.log('No token found in request');
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        req.user = decoded; // Attach user data to request
       

        next();
        
    } catch (error) {
        
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            error: error.message
        });
    }
};

module.exports = { protect };