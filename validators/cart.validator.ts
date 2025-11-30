import Joi from 'joi';

export const addToCartSchema = Joi.object({
  productId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid product ID format',
      'any.required': 'Product ID is required',
    }),

  quantity: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(1)
    .optional()
    .messages({
      'number.min': 'Quantity must be at least 1',
      'number.max': 'Quantity cannot exceed 100',
      'number.integer': 'Quantity must be a whole number',
    }),
});

export const updateQuantitySchema = Joi.object({
  quantity: Joi.number().integer().min(0).max(100).required().messages({
    'number.min': 'Quantity cannot be negative',
    'number.max': 'Quantity cannot exceed 100',
    'number.integer': 'Quantity must be a whole number',
    'any.required': 'Quantity is required',
  }),
});

export const productIdParamSchema = Joi.object({
  productId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid product ID format',
      'any.required': 'Product ID is required',
    }),
});
