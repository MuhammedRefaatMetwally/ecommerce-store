import { Response } from 'express';
import { ITokens } from '../types/auth.types';

const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true, // Prevent XSS attacks
  secure: isProduction, // HTTPS only in production
  sameSite: 'strict' as const, // Prevent CSRF attacks
  path: '/',
};

export const setCookies = (res: Response, tokens: ITokens): void => {
  res.cookie('accessToken', tokens.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const setAccessTokenCookie = (
  res: Response,
  accessToken: string
): void => {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
};

export const clearCookies = (res: Response): void => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
};
