import User from '../models/user.model';
import Product from '../models/product.model';
import { IUserDocument } from '../types/auth.types';
import { ICartItemResponse, ICartSummary } from '../types/cart.types';
import { AppError } from '../utils/appError';
import mongoose from 'mongoose';

const TAX_RATE = 0.08; 

export class CartService {
  
  async getCart(userId: string): Promise<ICartSummary> {
    const user = await User.findById(userId).populate('cartItems.product');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Filter out any items where product no longer exists
    const validCartItems = user.cartItems.filter(
      (item: any) => item.product !== null
    );

    if (validCartItems.length !== user.cartItems.length) {
      user.cartItems = validCartItems;
      await user.save();
    }

    return this.formatCartSummary(validCartItems);
  }

 
  async addToCart(
    userId: string,
    productId: string,
    quantity: number = 1
  ): Promise<ICartSummary> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    
    if (quantity < 1) {
      throw new AppError('Quantity must be at least 1', 400);
    }

    
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    
    const existingItemIndex = user.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      user.cartItems[existingItemIndex].quantity += quantity;
    } else {
      user.cartItems.push({
        product: productId,
        quantity: quantity
      });
    }

    await user.save();

    const updatedUser = await User.findById(userId).populate('cartItems.product');
    return this.formatCartSummary(updatedUser!.cartItems);
  }

  async updateQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<ICartSummary> {

    if (quantity < 0) {
      throw new AppError('Quantity cannot be negative', 400);
    }

    
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const itemIndex = user.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      throw new AppError('Product not found in cart', 404);
    }

    
    if (quantity === 0) {
      user.cartItems.splice(itemIndex, 1);
    } else {
      user.cartItems[itemIndex].quantity = quantity;
    }

    await user.save();

    const updatedUser = await User.findById(userId).populate('cartItems.product');
    return this.formatCartSummary(updatedUser!.cartItems);
  }


  async removeFromCart(userId: string, productId: string): Promise<ICartSummary> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    
    const initialLength = user.cartItems.length;
    user.cartItems = user.cartItems.filter(
      (item) => item.product.toString() !== productId
    );

    
    if (user.cartItems.length === initialLength) {
      throw new AppError('Product not found in cart', 404);
    }

    await user.save();

    const updatedUser = await User.findById(userId).populate('cartItems.product');
    return this.formatCartSummary(updatedUser!.cartItems);
  }


  async clearCart(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.cartItems = [];
    await user.save();
  }

 
  private formatCartSummary(cartItems: any[]): ICartSummary {
    const items: ICartItemResponse[] = cartItems.map((item: any) => {
      const product = item.product;
      const subtotal = product.price * item.quantity;

      return {
        product: {
          id: product._id.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          category: product.category
        },
        quantity: item.quantity,
        subtotal: parseFloat(subtotal.toFixed(2))
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      totalItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  }

 
  async validateCart(userId: string): Promise<{ valid: boolean; issues: string[] }> {
    const user = await User.findById(userId).populate('cartItems.product');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const issues: string[] = [];

    for (const item of user.cartItems) {
      if (!item.product) {
        issues.push('Some products in your cart are no longer available');
        continue;
      }

      const product = item.product as any;
      
      // move validation if needed
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

export const cartService = new CartService();