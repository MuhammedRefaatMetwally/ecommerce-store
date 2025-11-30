import { Document } from 'mongoose';

export interface ICoupon {
  code: string;
  discountPercentage: number;
  expirationDate: Date;
  isActive: boolean;
  userId: string;
  usageLimit?: number;
  usedCount: number;
  minimumPurchase?: number;
}

export interface ICouponDocument extends ICoupon, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCouponDTO {
  code: string;
  discountPercentage: number;
  expirationDate: Date;
  userId: string;
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
