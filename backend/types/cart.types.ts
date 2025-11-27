import { IProductDocument } from './product.types';

export interface ICartItem {
  product: string; // Product ObjectId
  quantity: number;
}

export interface ICartItemPopulated {
  product: IProductDocument;
  quantity: number;
}

export interface ICartItemResponse {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
  };
  quantity: number;
  subtotal: number; // price * quantity
}

export interface IAddToCartDTO {
  productId: string;
  quantity?: number;
}

export interface IUpdateQuantityDTO {
  quantity: number;
}

export interface ICartSummary {
  items: ICartItemResponse[];
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
}