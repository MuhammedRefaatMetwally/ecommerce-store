import jwt from 'jsonwebtoken';
import { redis } from '../lib/redis';
import { ITokens, ITokenPayload, IDecodedToken } from '../types/auth.types';
import { AppError } from '../utils/appError';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; 

export class TokenService {
 
  generateTokens(userId: string): ITokens {
    const payload: ITokenPayload = { userId };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY
    });

    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY
    });

    return { accessToken, refreshToken };
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      await redis.set(
        `refresh_token:${userId}`,
        refreshToken,
        'EX',
        REFRESH_TOKEN_TTL
      );
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw new AppError('Failed to store refresh token', 500);
    }
  }

  
  verifyAccessToken(token: string): IDecodedToken {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET) as IDecodedToken;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Access token expired', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid access token', 401);
      }
      throw new AppError('Token verification failed', 401);
    }
  }

 
  verifyRefreshToken(token: string): IDecodedToken {
    try {
      return jwt.verify(token, REFRESH_TOKEN_SECRET) as IDecodedToken;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Refresh token expired', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid refresh token', 401);
      }
      throw new AppError('Token verification failed', 401);
    }
  }

  
  async getStoredRefreshToken(userId: string): Promise<string | null> {
    try {
      return await redis.get(`refresh_token:${userId}`);
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  }

  
  async deleteRefreshToken(userId: string): Promise<void> {
    try {
      await redis.del(`refresh_token:${userId}`);
    } catch (error) {
      console.error('Error deleting refresh token:', error);
    }
  }

  
  async validateRefreshToken(token: string, userId: string): Promise<boolean> {
    try {
      const storedToken = await this.getStoredRefreshToken(userId);
      return storedToken === token;
    } catch (error) {
      console.error('Error validating refresh token:', error);
      return false;
    }
  }

 
  async revokeAllTokens(userId: string): Promise<void> {
    await this.deleteRefreshToken(userId);
  }
}

export const tokenService = new TokenService();