import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API Documentation',
      version: version || '1.0.0',
      description:
        'Complete API documentation for E-Commerce platform with authentication, products, cart, coupons, payments, and analytics',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api..com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description: 'Access token stored in HTTP-only cookie',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            status: {
              type: 'string',
              example: 'fail',
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            fullName: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['customer', 'admin'],
              example: 'customer',
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'iPhone 15 Pro',
            },
            description: {
              type: 'string',
              example: 'Latest flagship with A17 Pro chip',
            },
            price: {
              type: 'number',
              example: 999.99,
            },
            image: {
              type: 'string',
              example: 'https://res.cloudinary.com/...',
            },
            category: {
              type: 'string',
              enum: [
                'electronics',
                'clothing',
                'food',
                'books',
                'home',
                'sports',
                'toys',
                'other',
              ],
              example: 'electronics',
            },
            isFeatured: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            product: {
              $ref: '#/components/schemas/Product',
            },
            quantity: {
              type: 'number',
              example: 2,
            },
            subtotal: {
              type: 'number',
              example: 1999.98,
            },
          },
        },
        Cart: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CartItem',
              },
            },
            totalItems: {
              type: 'number',
              example: 2,
            },
            subtotal: {
              type: 'number',
              example: 1999.98,
            },
            tax: {
              type: 'number',
              example: 159.99,
            },
            total: {
              type: 'number',
              example: 2159.97,
            },
          },
        },
        Coupon: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            code: {
              type: 'string',
              example: 'SAVE20',
            },
            discountPercentage: {
              type: 'number',
              example: 20,
            },
            expirationDate: {
              type: 'string',
              format: 'date-time',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            usageLimit: {
              type: 'number',
              example: 5,
            },
            usedCount: {
              type: 'number',
              example: 2,
            },
            remainingUses: {
              type: 'number',
              example: 3,
            },
            minimumPurchase: {
              type: 'number',
              example: 50,
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            user: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: {
                    type: 'string',
                  },
                  quantity: {
                    type: 'number',
                  },
                  price: {
                    type: 'number',
                  },
                },
              },
            },
            totalAmount: {
              type: 'number',
              example: 864.0,
            },
            couponCode: {
              type: 'string',
              example: 'SAVE20',
            },
            discountAmount: {
              type: 'number',
              example: 199.99,
            },
            status: {
              type: 'string',
              enum: [
                'pending',
                'processing',
                'completed',
                'cancelled',
                'refunded',
              ],
              example: 'completed',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Products',
        description: 'Product management',
      },
      {
        name: 'Cart',
        description: 'Shopping cart operations',
      },
      {
        name: 'Coupons',
        description: 'Coupon management and validation',
      },
      {
        name: 'Payments',
        description: 'Payment processing and orders',
      },
      {
        name: 'Analytics',
        description: 'Business analytics and reports (Admin only)',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
