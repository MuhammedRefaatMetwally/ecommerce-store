import { Document } from 'mongoose';

export interface IUser {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  cartItems: ICartItem[];
}

export interface ICartItem {
  product: string;
  quantity: number;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(enteredPassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserResponse {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface ISignupDTO {
  fullName: string;
  email: string;
  password: string;
}

export interface ILoginDTO {
  email: string;
  password: string;
}

export interface ITokenPayload {
  userId: string;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse {
  success: boolean;
  message?: string;
  user: IUserResponse;
  tokens?: ITokens;
}

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin'
}

export interface IDecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

// This makes the file a module
export {};