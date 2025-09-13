// Base Error Class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// 400 Bad Request
class BadRequestError extends AppError {
    constructor(message = 'Bad Request') {
        super(message, 400);
    }
}

// 401 Unauthorized
class UnauthorizedError extends AppError {
    constructor(message = 'Not authorized') {
        super(message, 401);
    }
}

// 403 Forbidden
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}

// 404 Not Found
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

// 409 Conflict
class ConflictError extends AppError {
    constructor(message = 'Conflict') {
        super(message, 409);
    }
}

// 500 Internal Server Error
class InternalServerError extends AppError {
    constructor(message = 'Internal Server Error') {
        super(message, 500);
    }
}

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
    // Default error status and message
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Handle duplicate key errors (MongoDB)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Duplicate field value: ${field}. Please use another value.`;
        err = new BadRequestError(message);
    }

    // Handle validation errors (Mongoose)
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(el => el.message);
        const message = `Invalid input data: ${errors.join('. ')}`;
        err = new BadRequestError(message);
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please log in again.';
        err = new UnauthorizedError(message);
    }

    // Handle JWT expired errors
    if (err.name === 'TokenExpiredError') {
        const message = 'Your token has expired. Please log in again.';
        err = new UnauthorizedError(message);
    }

    // Send error response
    if (process.env.NODE_ENV === 'development') {
        // In development, send detailed error information
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // In production, send limited error information
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        } else {
            // Log the error for debugging
            console.error('ERROR 💥', err);
            
            // Send generic error message
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong!'
            });
        }
    }
};

module.exports = {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    InternalServerError,
    globalErrorHandler
};
