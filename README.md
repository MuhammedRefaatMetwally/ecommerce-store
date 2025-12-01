# E-Commerce API

A complete RESTful API for an e-commerce platform built with Node.js, TypeScript, Express, MongoDB, and Stripe. Features include user authentication, product management, shopping cart, coupon system, payment processing, and business analytics with the help of tools like Claude and Code Rabbit.

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Cache:** Redis (Upstash)
- **Authentication:** JWT (access + refresh tokens)
- **Payment:** Stripe
- **File Storage:** Cloudinary
- **Validation:** Joi
- **Documentation:** Swagger/OpenAPI 3.0

## Features

### Authentication
- User registration and login
- JWT-based authentication (access + refresh tokens)
- HTTP-only cookies for token storage
- Password hashing with bcrypt (12 salt rounds)
- Profile management
- Password change with token revocation
- Role-based access control (Customer/Admin)

### Product Management
- CRUD operations for products
- Product categories (electronics, clothing, food, books, home, sports, toys, other)
- Featured products
- Product recommendations
- Image upload to Cloudinary with optimization
- Filter by category, price range, featured status
- Admin-only management

### Shopping Cart
- Add/remove/update items
- Quantity validation (1-100)
- Automatic cart clearing after purchase
- Tax calculation (8%)
- Cart validation (check product availability)
- Product population with full details

### Coupon System
- Create and manage coupons
- Coupon validation with multiple checks:
  - Expiration date
  - Usage limits
  - Minimum purchase requirements
  - Active status
- Bulk coupon creation for multiple users
- Usage tracking with auto-deactivation
- Discount calculation
- Admin management tools
- Cleanup utility for expired coupons

### Payment Processing
- Stripe checkout integration
- Coupon application during checkout
- Tax calculation
- Order creation after successful payment
- Order history
- Order status management (pending, processing, completed, cancelled, refunded)
- Automatic reward coupons ($200+ purchases)
- Price validation (uses database prices, not client input)
- Duplicate order prevention

### Analytics (Admin Only)
- Dashboard overview:
  - Total users, new users this month, active users
  - Total products, featured products
  - Orders by status
  - Revenue with month-over-month growth
  - Coupon usage and total discounts
- Daily sales data
- Top selling products
- Revenue by category
- Redis caching (5-minute TTL)
- Flexible date ranges

### Additional Features
- Input validation on all endpoints
- Error handling with detailed messages
- Redis caching for performance
- Swagger API documentation
- Health check endpoint
- CORS configuration
- Security headers (Helmet)
- Request compression
- MongoDB query optimization with indexes

## API Endpoints

### Authentication
```
POST   /api/auth/signup              - Register new user
POST   /api/auth/login               - Login user
POST   /api/auth/logout              - Logout user
POST   /api/auth/refresh-token       - Refresh access token
GET    /api/auth/profile             - Get user profile
PUT    /api/auth/profile             - Update profile
POST   /api/auth/change-password     - Change password
```

### Products
```
GET    /api/products                 - Get all products (Admin)
POST   /api/products                 - Create product (Admin)
GET    /api/products/featured        - Get featured products
GET    /api/products/recommendations - Get random recommendations
GET    /api/products/category/:cat   - Get products by category
GET    /api/products/:id             - Get product by ID
PUT    /api/products/:id             - Update product (Admin)
DELETE /api/products/:id             - Delete product (Admin)
PATCH  /api/products/:id/featured    - Toggle featured status (Admin)
```

### Cart
```
GET    /api/cart                     - Get cart
POST   /api/cart                     - Add to cart
PUT    /api/cart/:productId          - Update quantity
DELETE /api/cart/:productId          - Remove item
DELETE /api/cart                     - Clear cart
GET    /api/cart/validate            - Validate cart
```

### Coupons
```
GET    /api/coupons                  - Get active coupon
GET    /api/coupons/my-coupons       - Get all user coupons
POST   /api/coupons/validate         - Validate coupon
POST   /api/coupons                  - Create coupon (Admin)
POST   /api/coupons/bulk             - Bulk create coupons (Admin)
GET    /api/coupons/all              - Get all coupons (Admin)
PATCH  /api/coupons/:id/deactivate   - Deactivate coupon (Admin)
DELETE /api/coupons/:id              - Delete coupon (Admin)
POST   /api/coupons/cleanup          - Cleanup expired (Admin)
```

### Payments
```
POST   /api/payments/create-checkout-session - Create Stripe session
POST   /api/payments/checkout-success         - Handle successful payment
GET    /api/payments/orders                   - Get user orders
GET    /api/payments/orders/:id               - Get order by ID
GET    /api/payments/orders/all               - Get all orders (Admin)
PATCH  /api/payments/orders/:id/status        - Update order status (Admin)
```

### Analytics
```
GET    /api/analytics                    - Complete overview (Admin)
GET    /api/analytics/sales              - Daily sales data (Admin)
GET    /api/analytics/products/top       - Top products (Admin)
GET    /api/analytics/revenue/category   - Revenue by category (Admin)
POST   /api/analytics/cache/clear        - Clear cache (Admin)
```

### Utility
```
GET    /health                          - Health check
GET    /api-docs                        - Swagger documentation
```

## Installation

### Prerequisites
- Node.js 18+
- MongoDB
- Redis (Upstash account)
- Cloudinary account
- Stripe account

### Environment Variables

Create a `.env` file:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Upstash Redis
UPSTASH_REDIS_URL=rediss://default:password@endpoint.upstash.io:6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT (generate with: openssl rand -base64 32)
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key

# Client
CLIENT_URL=http://localhost:3000

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Setup

1. Clone the repository
```bash
git clone <repository-url>
cd ecommerce-api
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Run in development
```bash
npm run dev
```

5. Build for production
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── controllers/       # Request handlers
├── services/          # Business logic
├── models/            # Mongoose schemas
├── routes/            # Route definitions
├── middleware/        # Custom middleware
├── validators/        # Joi validation schemas
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── lib/               # External service configs
└── server.ts          # Application entry point
```

## Architecture

- **Layered Architecture**: Controllers → Services → Models
- **Service Layer Pattern**: Business logic separated from HTTP handling
- **Repository Pattern**: Database operations abstracted
- **Dependency Injection**: Services injected into controllers
- **Error Handling**: Centralized error handler with custom error classes
- **Validation**: Input validation with Joi schemas
- **Caching**: Redis for frequently accessed data

## Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt
- Input validation and sanitization
- MongoDB injection prevention
- XSS protection with HTTP-only cookies
- CSRF protection with SameSite cookies
- Helmet.js for security headers
- Rate limiting ready
- Role-based access control
- Secure cookie configuration
- Environment-based security settings

## Performance Optimizations

- Redis caching (5-minute TTL for analytics)
- MongoDB indexes on frequently queried fields
- Mongoose lean queries
- Parallel query execution
- Image optimization on upload
- Request compression
- Connection pooling

## Data Models

### User
- Full name, email, password (hashed)
- Role (customer/admin)
- Cart items (embedded)
- Timestamps

### Product
- Name, description, price
- Image URL (Cloudinary)
- Category
- Featured status
- Timestamps

### Order
- User reference
- Products array (product, quantity, price)
- Total amount
- Coupon code and discount amount
- Stripe session ID
- Status (pending/processing/completed/cancelled/refunded)
- Timestamps

### Coupon
- Code (unique, uppercase)
- Discount percentage (0-100)
- Expiration date
- User reference
- Active status
- Usage limit and used count
- Minimum purchase requirement
- Timestamps

## API Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "status": "fail",
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Testing

Access Swagger documentation at `http://localhost:5000/api-docs` for interactive API testing.

### Quick Test Flow

1. **Signup**: POST `/api/auth/signup`
2. **Login**: POST `/api/auth/login`
3. **Browse Products**: GET `/api/products/featured`
4. **Add to Cart**: POST `/api/cart`
5. **Validate Coupon**: POST `/api/coupons/validate`
6. **Checkout**: POST `/api/payments/create-checkout-session`
7. **Complete Payment**: Use Stripe test cards
8. **Confirm Order**: POST `/api/payments/checkout-success`

### Test Cards (Stripe)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Development

```bash
# Run in development with hot reload
npm run dev

# Build TypeScript
npm run build

# Format code
npm run format

# Lint code
npm run lint
```

## Deployment Considerations

- Set `NODE_ENV=production`
- Use strong JWT secrets (32+ characters)
- Enable HTTPS
- Configure proper CORS origins
- Set up MongoDB replica set
- Use Redis persistence
- Enable Stripe webhooks for production
- Set up monitoring and logging
- Configure rate limiting
- Use PM2 or similar for process management

## Known Limitations

- No real-time notifications (WebSockets not implemented)
- No email service integration
- No password reset flow
- No 2FA support
- No product inventory management
- No shipping calculations
- No refund processing
- Single currency support (USD)

## API Rate Limits

Not implemented by default. Add `express-rate-limit` for production:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```
## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a pull request

## Support

For issues and questions, please open a GitHub issue.
