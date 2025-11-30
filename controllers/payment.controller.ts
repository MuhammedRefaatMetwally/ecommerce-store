import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * @desc    Create Stripe checkout session
 * @route   POST /api/payments/create-checkout-session
 * @access  Private
 */
export const createCheckoutSession = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { products, couponCode } = req.body;

    const session = await paymentService.createCheckoutSession(
      req.user!._id.toString(),
      products,
      couponCode
    );

    res.status(200).json({
      success: true,
      data: session,
    });
  }
);

/**
 * @desc    Handle successful checkout
 * @route   POST /api/payments/checkout-success
 * @access  Private
 */
export const checkoutSuccess = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.body;

    const order = await paymentService.handleCheckoutSuccess(sessionId);

    res.status(200).json({
      success: true,
      message: 'Payment successful and order created',
      data: {
        orderId: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
      },
    });
  }
);

/**
 * @desc    Get user's orders
 * @route   GET /api/payments/orders
 * @access  Private
 */
export const getUserOrders = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const orders = await paymentService.getUserOrders(req.user!._id.toString());

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  }
);

/**
 * @desc    Get order by ID
 * @route   GET /api/payments/orders/:id
 * @access  Private
 */
export const getOrderById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const order = await paymentService.getOrderById(
      req.params.id,
      req.user!._id.toString()
    );

    res.status(200).json({
      success: true,
      data: order,
    });
  }
);

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/payments/orders/all
 * @access  Private/Admin
 */
export const getAllOrders = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const orders = await paymentService.getAllOrders();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  }
);

/**
 * @desc    Update order status (Admin only)
 * @route   PATCH /api/payments/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;

    const order = await paymentService.updateOrderStatus(req.params.id, status);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  }
);
