import mongoose, { Document } from 'mongoose';

export interface IOrderItem {
  product: string;
  quantity: number;
  price: number;
}

export interface IOrder {
  user: mongoose.Types.ObjectId | string;
  products: IOrderItem[];
  totalAmount: number;
  stripeSessionId?: string;
  couponCode?: string;
  discountAmount?: number;
  status: OrderStatus;
}

export interface IOrderDocument extends IOrder, Document {
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export interface ICreateCheckoutDTO {
  products: ICheckoutProduct[];
  couponCode?: string;
}

export interface ICheckoutProduct {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ICheckoutSessionResponse {
  sessionId: string;
  url: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export interface IOrderResponse {
  id: string;
  user: string;
  products: IOrderItem[];
  totalAmount: number;
  couponCode?: string;
  discountAmount?: number;
  status: OrderStatus;
  createdAt: Date;
}
