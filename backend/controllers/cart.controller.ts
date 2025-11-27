import { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cart.service';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const cart = await cartService.getCart(req.user!._id.toString());

    res.status(200).json({
      success: true,
      data: cart
    });
  }
);

/**
 * @desc    Add product to cart
 * @route   POST /api/cart
 * @access  Private
 */
export const addToCart = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId, quantity } = req.body;

    const cart = await cartService.addToCart(
      req.user!._id.toString(),
      productId,
      quantity || 1
    );

    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully',
      data: cart
    });
  }
);

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:productId
 * @access  Private
 */
export const updateCartItemQuantity = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await cartService.updateQuantity(
      req.user!._id.toString(),
      productId,
      quantity
    );

    res.status(200).json({
      success: true,
      message: quantity === 0 
        ? 'Product removed from cart'
        : 'Cart updated successfully',
      data: cart
    });
  }
);

/**
 * @desc    Remove product from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private
 */
export const removeFromCart = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    const cart = await cartService.removeFromCart(
      req.user!._id.toString(),
      productId
    );

    res.status(200).json({
      success: true,
      message: 'Product removed from cart successfully',
      data: cart
    });
  }
);

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await cartService.clearCart(req.user!._id.toString());

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        items: [],
        totalItems: 0,
        subtotal: 0,
        tax: 0,
        total: 0
      }
    });
  }
);

/**
 * @desc    Validate cart items
 * @route   GET /api/cart/validate
 * @access  Private
 */
export const validateCart = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const validation = await cartService.validateCart(req.user!._id.toString());

    res.status(200).json({
      success: true,
      data: validation
    });
  }
);