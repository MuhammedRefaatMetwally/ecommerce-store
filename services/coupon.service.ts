import Coupon from '../models/coupon.model';
import {
  ICreateCouponDTO,
  ICouponResponse,
  ICouponValidationResult,
} from '../types/coupon.types';
import { AppError } from '../utils/appError';

export class CouponService {
  async getUserCoupon(userId: string): Promise<ICouponResponse | null> {
    const coupon = await Coupon.findOne({
      userId,
      isActive: true,
      expirationDate: { $gt: new Date() },
    });

    if (!coupon) {
      return null;
    }

    return this.formatCouponResponse(coupon);
  }

  async getAllUserCoupons(userId: string): Promise<ICouponResponse[]> {
    const coupons = await Coupon.find({ userId }).sort({ createdAt: -1 });
    return coupons.map(coupon => this.formatCouponResponse(coupon));
  }

  async validateCoupon(
    userId: string,
    code: string,
    cartTotal: number = 0
  ): Promise<ICouponValidationResult> {
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      userId,
      isActive: true,
    });

    if (!coupon) {
      return {
        valid: false,
        message: 'Invalid coupon code',
      };
    }

    if (coupon.isExpired()) {
      coupon.isActive = false;
      await coupon.save();

      return {
        valid: false,
        message: 'Coupon has expired',
      };
    }

    if (!coupon.hasUsesRemaining()) {
      coupon.isActive = false;
      await coupon.save();

      return {
        valid: false,
        message: 'Coupon usage limit reached',
      };
    }

    if (coupon.minimumPurchase && cartTotal < coupon.minimumPurchase) {
      return {
        valid: false,
        message: `Minimum purchase of $${coupon.minimumPurchase.toFixed(2)} required`,
      };
    }

    const discountAmount = (cartTotal * coupon.discountPercentage) / 100;

    return {
      valid: true,
      coupon: {
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
      },
    };
  }

  async applyCoupon(userId: string, code: string): Promise<void> {
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      userId,
      isActive: true,
    });

    if (!coupon) {
      throw new AppError('Invalid coupon code', 400);
    }

    if (coupon.isExpired()) {
      throw new AppError('Coupon has expired', 400);
    }

    if (!coupon.hasUsesRemaining()) {
      throw new AppError('Coupon usage limit reached', 400);
    }

    await coupon.incrementUsage();
  }

  async createCoupon(data: ICreateCouponDTO): Promise<ICouponResponse> {
    const existingCoupon = await Coupon.findOne({
      code: data.code.toUpperCase(),
    });
    if (existingCoupon) {
      throw new AppError('Coupon code already exists', 400);
    }

    const coupon = await Coupon.create({
      ...data,
      code: data.code.toUpperCase(),
    });

    return this.formatCouponResponse(coupon);
  }

  async deactivateCoupon(couponId: string): Promise<void> {
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    coupon.isActive = false;
    await coupon.save();
  }

  async getAllCoupons(): Promise<ICouponResponse[]> {
    const coupons = await Coupon.find()
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 });

    return coupons.map(coupon => this.formatCouponResponse(coupon));
  }

  async deleteCoupon(couponId: string): Promise<void> {
    const coupon = await Coupon.findByIdAndDelete(couponId);

    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }
  }

  async createBulkCoupons(
    userIds: string[],
    couponData: Omit<ICreateCouponDTO, 'userId' | 'code'>,
    codePrefix: string = 'PROMO'
  ): Promise<ICouponResponse[]> {
    const coupons: ICouponResponse[] = [];

    for (const userId of userIds) {
      const code = `${codePrefix}${userId.slice(-6).toUpperCase()}`;

      try {
        const coupon = await this.createCoupon({
          ...couponData,
          code,
          userId,
        });
        coupons.push(coupon);
      } catch (error) {
        console.error(`Failed to create coupon for user ${userId}:`, error);
      }
    }

    return coupons;
  }

  async cleanupExpiredCoupons(): Promise<number> {
    const result = await Coupon.updateMany(
      {
        expirationDate: { $lt: new Date() },
        isActive: true,
      },
      {
        $set: { isActive: false },
      }
    );

    return result.modifiedCount;
  }

  private formatCouponResponse(coupon: any): ICouponResponse {
    return {
      id: coupon._id.toString(),
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      expirationDate: coupon.expirationDate,
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
      remainingUses: coupon.usageLimit
        ? coupon.usageLimit - coupon.usedCount
        : undefined,
      minimumPurchase: coupon.minimumPurchase,
    };
  }
}

export const couponService = new CouponService();
