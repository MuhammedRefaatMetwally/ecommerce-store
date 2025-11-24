import { Request, Response, NextFunction } from 'express';
import { tokenService } from '../services/token.service';
import User from '../models/user.model';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { UserRole } from '../types/auth.types';


export const protectRoute = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new AppError('Unauthorized - No access token provided', 401);
    }

    const decoded = tokenService.verifyAccessToken(token);

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError('Unauthorized - User not found', 401);
    }

    req.user = user;

    next();
  }
);


export const adminRoute = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError('Unauthorized - Authentication required', 401);
  }

  if (req.user.role !== UserRole.ADMIN) {
    throw new AppError('Forbidden - Admin access required', 403);
  }

  next();
};

export const customerRoute = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError('Unauthorized - Authentication required', 401);
  }

  if (req.user.role !== UserRole.CUSTOMER && req.user.role !== UserRole.ADMIN) {
    throw new AppError('Forbidden - Customer or Admin access required', 403);
  }

  next();
};