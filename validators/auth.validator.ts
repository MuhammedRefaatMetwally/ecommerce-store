import Joi from 'joi';

export const signupSchema = Joi.object({
  fullName: Joi.string().min(2).max(50).trim().required().messages({
    'string.empty': 'Full name is required',
    'string.min': 'Full name must be at least 2 characters',
    'string.max': 'Full name cannot exceed 50 characters',
    'any.required': 'Full name is required',
  }),

  email: Joi.string().email().lowercase().trim().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),

  password: Joi.string().min(6).max(128).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
    'string.max': 'Password cannot exceed 128 characters',
    'any.required': 'Password is required',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),

  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'Current password is required',
    'any.required': 'Current password is required',
  }),

  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .invalid(Joi.ref('currentPassword'))
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters',
      'string.max': 'New password cannot exceed 128 characters',
      'any.required': 'New password is required',
      'any.invalid': 'New password must be different from current password',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your new password',
    }),
});

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(50).trim().optional().messages({
    'string.min': 'Full name must be at least 2 characters',
    'string.max': 'Full name cannot exceed 50 characters',
  }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update', //Means the object must have at least 1 key.
  });
