import mongoose, { Document, Types } from 'mongoose';

export interface ICoupon {
  code: string;
  discountPercentage: number;
  expirationDate: Date;
  isActive: boolean;
  userId: Types.ObjectId;
  usageLimit?: number;
  usedCount: number;
  minimumPurchase?: number;
}

export interface ICouponDocument
  extends Document<unknown, {}, ICoupon>,
    ICoupon {
  createdAt: Date;
  updatedAt: Date;

  isExpired(): boolean;
  hasUsesRemaining(): boolean;
  incrementUsage(): Promise<void>;

  remainingUses?: number;
}

export interface ICreateCouponDTO {
  code: string;
  discountPercentage: number;
  expirationDate: Date;
  userId: string | Types.ObjectId;
  usageLimit?: number;
  minimumPurchase?: number;
}

export interface IValidateCouponDTO {
  code: string;
  cartTotal?: number;
}

export interface ICouponResponse {
  id: string;
  code: string;
  discountPercentage: number;
  expirationDate: Date;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  remainingUses?: number;
  minimumPurchase?: number;
}

export interface ICouponValidationResult {
  valid: boolean;
  coupon?: {
    code: string;
    discountPercentage: number;
    discountAmount: number;
  };
  message?: string;
}
