import User from '../models/user.model';
import { tokenService } from './token.service';
import {
  ISignupDTO,
  ILoginDTO,
  IUserDocument,
  IUserResponse,
  ITokens
} from '../types/auth.types';
import { AppError } from '../utils/appError';

export class AuthService {

  async signup(data: ISignupDTO): Promise<{ user: IUserResponse; tokens: ITokens }> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('Email already exists. Please use a different email.', 400);
    }

    const user = await User.create({
      fullName: data.fullName,
      email: data.email,
      password: data.password
    });

    const tokens = tokenService.generateTokens(user._id.toString());

    await tokenService.storeRefreshToken(user._id.toString(), tokens.refreshToken);

    const userResponse = this.formatUserResponse(user);

    return { user: userResponse, tokens };
  }

 
  async login(data: ILoginDTO): Promise<{ user: IUserResponse; tokens: ITokens }> {
    const user = await User.findOne({ email: data.email }).select('+password');

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokens = tokenService.generateTokens(user._id.toString());

    await tokenService.storeRefreshToken(user._id.toString(), tokens.refreshToken);

    const userResponse = this.formatUserResponse(user);

    return { user: userResponse, tokens };
  }

 
  async logout(userId: string): Promise<void> {
    await tokenService.deleteRefreshToken(userId);
  }


  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const decoded = tokenService.verifyRefreshToken(refreshToken);

    const isValid = await tokenService.validateRefreshToken(
      refreshToken,
      decoded.userId
    );

    if (!isValid) {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    const tokens = tokenService.generateTokens(decoded.userId);

    return { accessToken: tokens.accessToken };
  }

  
  async getProfile(userId: string): Promise<IUserResponse> {
    const user = await User.findById(userId).populate('cartItems.product');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return this.formatUserResponse(user);
  }

 
  async updateProfile(
    userId: string,
    data: { fullName?: string }
  ): Promise<IUserResponse> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return this.formatUserResponse(user);
  }


  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    await tokenService.revokeAllTokens(userId);
  }


  private formatUserResponse(user: IUserDocument): IUserResponse {
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role
    };
  }
}

export const authService = new AuthService();