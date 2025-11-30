import Joi from 'joi';

export const createCouponSchema = Joi.object({
  code: Joi.string()
    .uppercase()
    .trim()
    .min(3)
    .max(20)
    .pattern(/^[A-Z0-9]+$/)
    .required()
    .messages({
      'string.empty': 'Coupon code is required',
      'string.min': 'Coupon code must be at least 3 characters',
      'string.max': 'Coupon code cannot exceed 20 characters',
      'string.pattern.base':
        'Coupon code can only contain uppercase letters and numbers',
      'any.required': 'Coupon code is required',
    }),

  discountPercentage: Joi.number().min(0).max(100).required().messages({
    'number.min': 'Discount cannot be negative',
    'number.max': 'Discount cannot exceed 100%',
    'any.required': 'Discount percentage is required',
  }),

  expirationDate: Joi.date().greater('now').required().messages({
    'date.greater': 'Expiration date must be in the future',
    'any.required': 'Expiration date is required',
  }),

  userId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid user ID format',
      'any.required': 'User ID is required',
    }),

  usageLimit: Joi.number().integer().min(1).optional().messages({
    'number.min': 'Usage limit must be at least 1',
    'number.integer': 'Usage limit must be a whole number',
  }),

  minimumPurchase: Joi.number().min(0).optional().messages({
    'number.min': 'Minimum purchase cannot be negative',
  }),
});

export const validateCouponSchema = Joi.object({
  code: Joi.string().uppercase().trim().required().messages({
    'string.empty': 'Coupon code is required',
    'any.required': 'Coupon code is required',
  }),

  cartTotal: Joi.number().min(0).optional().messages({
    'number.min': 'Cart total cannot be negative',
  }),
});

export const bulkCouponSchema = Joi.object({
  userIds: Joi.array()
    .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one user ID is required',
      'any.required': 'User IDs are required',
    }),

  discountPercentage: Joi.number().min(0).max(100).required(),

  expirationDate: Joi.date().greater('now').required(),

  usageLimit: Joi.number().integer().min(1).optional(),

  minimumPurchase: Joi.number().min(0).optional(),

  codePrefix: Joi.string()
    .uppercase()
    .trim()
    .min(2)
    .max(10)
    .default('PROMO')
    .optional(),
});

export const couponIdSchema = Joi.object({
  id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid coupon ID format',
      'any.required': 'Coupon ID is required',
    }),
});
