🛒 E-Commerce Backend (Node.js + MongoDB)

A clean  E-Commerce REST API built with Node.js, Express, and MongoDB, featuring authentication, Stripe payment, coupons, product management, and image upload.

🚀 Main Features
🔐 Authentication

JWT Access + Refresh tokens

Refresh token stored in HTTP-only cookie

Role-based access (User / Admin)

🛍️ Products & Categories

CRUD operations

Image upload using Cloudinary

🛒 Cart

Add / update / remove items

Cart cleared automatically after successful purchase

🎟️ Coupons

Percentage-based discounts

Usage limit, minimum purchase

User-specific coupons

Auto reward coupon when order ≥ $200

💳 Payments (Stripe Checkout)

Creates Stripe Checkout Session

Calculates subtotal, discount, tax and total

After payment success, frontend sends session_id → backend finalizes order

Prevents duplicate orders

Applies coupon & creates reward coupon

📦 Orders

User order history

Admin: view and update all orders

📊 Analytics

Basic revenue and order statistics

Redis caching for faster responses
