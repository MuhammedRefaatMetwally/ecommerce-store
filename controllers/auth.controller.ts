import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import {
  setCookies,
  setAccessTokenCookie,
  clearCookies,
} from '../utils/cookies';
import { tokenService } from '../services/token.service';

/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user, tokens } = await authService.signup(req.body);

    setCookies(res, tokens);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user,
    });
  }
);

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user, tokens } = await authService.login(req.body);

    // Set cookies
    setCookies(res, tokens);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user,
    });
  }
);

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const decoded = tokenService.verifyRefreshToken(refreshToken);
        await authService.logout(decoded.userId);
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }

    clearCookies(res);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  }
);

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided',
      });
    }

    const { accessToken } = await authService.refreshAccessToken(refreshToken);

    setAccessTokenCookie(res, accessToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
    });
  }
);

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await authService.getProfile(req.user!._id.toString());

    res.status(200).json({
      success: true,
      user,
    });
  }
);

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await authService.updateProfile(
      req.user!._id.toString(),
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  }
);

/**
 * @desc    Change password
 * @route   POST /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(
      req.user!._id.toString(),
      currentPassword,
      newPassword
    );

    clearCookies(res);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again.',
    });
  }
);
