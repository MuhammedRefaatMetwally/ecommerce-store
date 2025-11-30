import Joi from 'joi';
import { ProductCategory } from '../types/product.types';

export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).trim().required().messages({
    'string.empty': 'Product name is required',
    'string.min': 'Product name must be at least 3 characters',
    'string.max': 'Product name cannot exceed 100 characters',
  }),

  description: Joi.string().min(10).max(2000).trim().required().messages({
    'string.empty': 'Product description is required',
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description cannot exceed 2000 characters',
  }),

  price: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Price must be a number',
    'number.positive': 'Price must be greater than 0',
    'any.required': 'Price is required',
  }),

  image: Joi.string().uri().allow('').optional().messages({
    'string.uri': 'Image must be a valid URL',
  }),

  category: Joi.string()
    .valid(...Object.values(ProductCategory))
    .required()
    .messages({
      'any.only':
        'Invalid category. Must be one of: ' +
        Object.values(ProductCategory).join(', '),
      'any.required': 'Category is required',
    }),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).trim().optional(),

  description: Joi.string().min(10).max(2000).trim().optional(),

  price: Joi.number().positive().precision(2).optional(),

  image: Joi.string().uri().optional(),

  category: Joi.string()
    .valid(...Object.values(ProductCategory))
    .optional(),

  isFeatured: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

export const productIdSchema = Joi.object({
  id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid product ID format',
      'any.required': 'Product ID is required',
    }),
});

export const categoryParamSchema = Joi.object({
  category: Joi.string()
    .valid(...Object.values(ProductCategory))
    .required()
    .messages({
      'any.only': 'Invalid category',
      'any.required': 'Category is required',
    }),
});

export const productFilterSchema = Joi.object({
  category: Joi.string()
    .valid(...Object.values(ProductCategory))
    .optional(),

  isFeatured: Joi.boolean().optional(),

  minPrice: Joi.number().min(0).optional(),

  maxPrice: Joi.number().min(0).optional(),

  page: Joi.number().integer().min(1).default(1).optional(),

  limit: Joi.number().integer().min(1).max(100).default(10).optional(),
});
