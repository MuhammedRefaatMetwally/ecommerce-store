import Joi from 'joi';

export const analyticsQuerySchema = Joi.object({
  startDate: Joi.date()
    .iso()
    .optional()
    .default(() => {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      return date;
    })
    .messages({
      'date.base': 'Start date must be a valid date',
      'date.iso': 'Start date must be in ISO format'
    }),

  endDate: Joi.date()
    .iso()
    .optional()
    .default(() => new Date())
    .greater(Joi.ref('startDate'))
    .messages({
      'date.base': 'End date must be a valid date',
      'date.iso': 'End date must be in ISO format',
      'date.greater': 'End date must be after start date'
    }),

  days: Joi.number()
    .integer()
    .min(1)
    .max(365)
    .optional()
    .messages({
      'number.min': 'Days must be at least 1',
      'number.max': 'Days cannot exceed 365'
    })
});

export const topProductsQuerySchema = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .optional()
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 50'
    })
});