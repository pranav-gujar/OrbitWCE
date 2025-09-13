const { ForbiddenError, UnauthorizedError } = require('../utils/errorHandler');

// Middleware to check if user has required role
const requireRole = (roles) => {
    return (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                throw new UnauthorizedError('Authentication required');
            }

            // Check if user has any of the required roles
            const hasRequiredRole = Array.isArray(roles) 
                ? roles.includes(req.user.role)
                : req.user.role === roles;

            if (!hasRequiredRole) {
                throw new ForbiddenError('Insufficient permissions');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Middleware to check if user has superadmin role
const isSuperAdmin = requireRole('superadmin');
const isUser = requireRole('user');

// Middleware to check if user has any of the admin roles
const isAdminOrSuperAdmin = requireRole(['admin', 'superadmin']);

// Middleware to check if user is the owner of the resource or is a superadmin
const isOwnerOrAdmin = (modelName, idParam = 'id') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new UnauthorizedError('Authentication required');
            }

            // Allow superadmins to bypass ownership check
            if (req.user.role === 'superadmin') {
                return next();
            }

            // Get the model
            const Model = require(`../models/${modelName}`);
            const resource = await Model.findById(req.params[idParam]);

            if (!resource) {
                throw new Error(`${modelName} not found`);
            }

            // Check if the user is the owner
            if (resource.user && resource.user.toString() === req.user.id) {
                return next();
            }

            // Check for user reference in different formats
            if (resource.userId && resource.userId.toString() === req.user.id) {
                return next();
            }

            if (resource.owner && resource.owner.toString() === req.user.id) {
                return next();
            }

            // If no ownership is found, check for any user-specific fields
            const userFields = ['user', 'userId', 'owner', 'createdBy', 'user_id'];
            for (const field of userFields) {
                if (resource[field] && resource[field].toString() === req.user.id) {
                    return next();
                }
            }

            throw new ForbiddenError('Not authorized to access this resource');
        } catch (error) {
            next(error);
        }
    };
};

// Middleware to authorize based on role
const authorize = (roles) => {
    return (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                throw new UnauthorizedError('Authentication required');
            }

            // Check if user has any of the required roles
            const hasRequiredRole = Array.isArray(roles) 
                ? roles.includes(req.user.role)
                : req.user.role === roles;

            if (!hasRequiredRole) {
                throw new ForbiddenError(`Access denied. Required role: ${Array.isArray(roles) ? roles.join(' or ') : roles}`);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    requireRole,
    isSuperAdmin,
    isUser,
    isAdminOrSuperAdmin,
    isOwnerOrAdmin,
    authorize
};
