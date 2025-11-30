import { stripe } from '../lib/stripe';
import Stripe from 'stripe';
import Product from '../models/product.model';
import Coupon from '../models/coupon.model';
import Order from '../models/order.model';
import User from '../models/user.model';
import { couponService } from './coupon.service';
import { AppError } from '../utils/appError';
import {
  ICheckoutProduct,
  ICheckoutSessionResponse,
  OrderStatus,
} from '../types/order.types';

const TAX_RATE = 0.08; // 8% tax
const REWARD_THRESHOLD = 200; // $200 spending threshold to have a coupon

export class PaymentService {
  async createCheckoutSession(
    userId: string,
    products: ICheckoutProduct[],
    couponCode?: string
  ): Promise<ICheckoutSessionResponse> {
    if (!Array.isArray(products) || products.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    const productIds = products.map(p => p._id);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    if (dbProducts.length !== products.length) {
      throw new AppError('Some products are no longer available', 400);
    }

    let subtotal = 0;
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      products.map(product => {
        const dbProduct = dbProducts.find(
          p => p._id.toString() === product._id
        );

        if (!dbProduct) {
          throw new AppError(`Product ${product.name} not found`, 404);
        }

        const amount = Math.round(dbProduct.price * 100); // Convert to cents
        subtotal += dbProduct.price * product.quantity;

        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: dbProduct.name,
              description: dbProduct.description,
              images: [dbProduct.image],
            },
            unit_amount: amount,
          },
          quantity: product.quantity,
        };
      });

    let discount = 0;
    let couponData = null;

    if (couponCode) {
      const validation = await couponService.validateCoupon(
        userId,
        couponCode,
        subtotal
      );

      if (!validation.valid) {
        throw new AppError(validation.message || 'Invalid coupon', 400);
      }

      discount = validation.coupon!.discountAmount;
      couponData = validation.coupon;
    }

    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * TAX_RATE;
    const total = taxableAmount + tax;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      metadata: {
        userId: userId,
        couponCode: couponCode || '',
        subtotal: subtotal.toString(),
        discount: discount.toString(),
        tax: tax.toString(),
        productIds: JSON.stringify(
          products.map(p => ({ id: p._id, quantity: p.quantity }))
        ),
      },
    };

    if (couponData) {
      const stripeCoupon = await this.createStripeCoupon(
        couponData.discountPercentage
      );
      sessionParams.discounts = [{ coupon: stripeCoupon }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Create reward coupon if threshold met
    if (total >= REWARD_THRESHOLD) {
      await this.createRewardCoupon(userId);
    }

    return {
      sessionId: session.id,
      url: session.url!,
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }

  async handleCheckoutSuccess(sessionId: string): Promise<any> {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price.product'],
    });

    if (session.payment_status !== 'paid') {
      throw new AppError('Payment not completed', 400);
    }

    const userId = session.metadata!.userId;

    const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
    if (existingOrder) {
      return existingOrder;
    }

    // Extract purchased products
    const productIds = JSON.parse(session.metadata!.productIds || '[]');
    const lineItems = session.line_items?.data || [];

    const products = productIds.map((p: any, index: number) => ({
      product: p.id,
      quantity: p.quantity,
      price: (lineItems[index]?.amount_total || 0) / 100,
    }));

    const couponCode = session.metadata!.couponCode || undefined;
    const discount = parseFloat(session.metadata!.discount || '0');

    const order = await Order.create({
      user: userId,
      products,
      totalAmount: (session.amount_total || 0) / 100,
      stripeSessionId: sessionId,
      couponCode,
      discountAmount: discount,
      status: OrderStatus.COMPLETED,
    });

    // Apply the coupon AFTER order creation to be  safe
    if (couponCode) {
      try {
        await couponService.applyCoupon(userId, couponCode);
      } catch (error) {
        console.error('Error applying coupon:', error);
      }
    }

    if (order.totalAmount >= REWARD_THRESHOLD) {
      try {
        await this.createRewardCoupon(userId);
      } catch (error) {
        console.error('Error creating reward coupon:', error);
      }
    }

    await User.findByIdAndUpdate(userId, { $set: { cartItems: [] } });

    return order;
  }

  async getUserOrders(userId: string): Promise<any[]> {
    const orders = await Order.find({ user: userId })
      .populate('products.product')
      .sort({ createdAt: -1 });

    return orders;
  }

  async getOrderById(orderId: string, userId: string): Promise<any> {
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).populate('products.product');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  private async createStripeCoupon(
    discountPercentage: number
  ): Promise<string> {
    const coupon = await stripe.coupons.create({
      percent_off: discountPercentage,
      duration: 'once',
    });

    return coupon.id;
  }

  private async createRewardCoupon(userId: string): Promise<void> {
    try {
      const existingReward = await Coupon.findOne({
        userId,
        code: { $regex: /^REWARD/ },
        isActive: true,
      });

      if (existingReward) {
        return;
      }

      const code = `REWARD${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      await couponService.createCoupon({
        code,
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId,
        usageLimit: 1,
        minimumPurchase: 50,
      });

      console.log(`✨ Reward coupon ${code} created for user ${userId}`);
    } catch (error) {
      console.error('Error creating reward coupon:', error);
    }
  }

  async getAllOrders(): Promise<any[]> {
    const orders = await Order.find()
      .populate('user', 'fullName email')
      .populate('products.product')
      .sort({ createdAt: -1 });

    return orders;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<any> {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status } },
      { new: true }
    ).populate('products.product');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }
}

export const paymentService = new PaymentService();
