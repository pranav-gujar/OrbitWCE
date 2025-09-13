import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .label('Email')
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
    }),
  password: Joi.string()
    .min(8)
    .max(30)
    .required()
    .label('Password')
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot be longer than 30 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    }),
});

export const registerSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .label('Name')
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name cannot be longer than 50 characters',
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .label('Email')
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
    }),
  password: Joi.string()
    .min(8)
    .max(30)
    .required()
    .label('Password')
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot be longer than 30 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    }),
  confirmPassword: Joi.any()
    .equal(Joi.ref('password'))
    .required()
    .label('Confirm Password')
    .messages({ 'any.only': 'Passwords do not match' }),
  role: Joi.string()
    .valid('user', 'community')
    .default('user')
    .label('Role')
    .messages({
      'any.only': 'Please select a valid role',
    }),
}).with('password', 'confirmPassword');

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .label('Email')
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
    }),
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(6)
    .required()
    .label('New Password')
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'Password must be at least 6 characters long',
    }),
  confirmPassword: Joi.any()
    .equal(Joi.ref('password'))
    .required()
    .label('Confirm New Password')
    .messages({ 'any.only': 'Passwords do not match' }),
}).with('password', 'confirmPassword');

// Helper function to validate a form against a schema
export const validateForm = async (schema, values) => {
  try {
    await schema.validateAsync(values, { abortEarly: false });
    return {}; // No errors
  } catch (error) {
    const validationErrors = {};
    error.details.forEach((detail) => {
      validationErrors[detail.path[0]] = detail.message;
    });
    return validationErrors;
  }
};

export default {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validateForm,
};
