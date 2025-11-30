import { Document } from 'mongoose';

export interface IProduct {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isFeatured: boolean;
}

export interface IProductDocument extends IProduct, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateProductDTO {
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
}

export interface IUpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
  isFeatured?: boolean;
}

export interface IProductFilter {
  category?: string;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface ICloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export enum ProductCategory {
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  FOOD = 'food',
  BOOKS = 'books',
  HOME = 'home',
  SPORTS = 'sports',
  TOYS = 'toys',
  OTHER = 'other',
}
