import Joi from 'joi';
import { OrderStatus } from '../types/order.types';

export const createCheckoutSchema = Joi.object({
  products: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .required()
          .messages({
            'string.pattern.base': 'Invalid product ID format',
          }),
        name: Joi.string().required(),
        price: Joi.number().min(0).required(),
        quantity: Joi.number().integer().min(1).required(),
        image: Joi.string().uri().required(),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Cart cannot be empty',
      'any.required': 'Products are required',
    }),

  couponCode: Joi.string().uppercase().trim().optional().allow(''),
});

export const checkoutSuccessSchema = Joi.object({
  sessionId: Joi.string().required().messages({
    'string.empty': 'Session ID is required',
    'any.required': 'Session ID is required',
  }),
});

export const orderIdSchema = Joi.object({
  id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid order ID format',
      'any.required': 'Order ID is required',
    }),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(OrderStatus))
    .required()
    .messages({
      'any.only': 'Invalid order status',
      'any.required': 'Order status is required',
    }),
});
