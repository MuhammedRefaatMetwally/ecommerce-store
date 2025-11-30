import { Request, Response, NextFunction } from 'express';
import { couponService } from '../services/coupon.service';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * @desc    Get user's active coupon
 * @route   GET /api/coupons
 * @access  Private
 */
export const getUserCoupon = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const coupon = await couponService.getUserCoupon(req.user!._id.toString());

    res.status(200).json({
      success: true,
      data: coupon,
    });
  }
);

/**
 * @desc    Get all user's coupons
 * @route   GET /api/coupons/my-coupons
 * @access  Private
 */
export const getAllUserCoupons = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const coupons = await couponService.getAllUserCoupons(
      req.user!._id.toString()
    );

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  }
);

/**
 * @desc    Validate coupon code
 * @route   POST /api/coupons/validate
 * @access  Private
 */
export const validateCoupon = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code, cartTotal } = req.body;

    const result = await couponService.validateCoupon(
      req.user!._id.toString(),
      code,
      cartTotal || 0
    );

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon is valid',
      data: result.coupon,
    });
  }
);

/**
 * @desc    Create new coupon (Admin only)
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
export const createCoupon = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const coupon = await couponService.createCoupon(req.body);

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  }
);

/**
 * @desc    Get all coupons (Admin only)
 * @route   GET /api/coupons/all
 * @access  Private/Admin
 */
export const getAllCoupons = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const coupons = await couponService.getAllCoupons();

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  }
);

/**
 * @desc    Deactivate coupon (Admin only)
 * @route   PATCH /api/coupons/:id/deactivate
 * @access  Private/Admin
 */
export const deactivateCoupon = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await couponService.deactivateCoupon(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Coupon deactivated successfully',
    });
  }
);

/**
 * @desc    Delete coupon (Admin only)
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await couponService.deleteCoupon(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  }
);

/**
 * @desc    Create bulk coupons (Admin only)
 * @route   POST /api/coupons/bulk
 * @access  Private/Admin
 */
export const createBulkCoupons = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userIds, codePrefix, ...couponData } = req.body;

    const coupons = await couponService.createBulkCoupons(
      userIds,
      couponData,
      codePrefix
    );

    res.status(201).json({
      success: true,
      message: `${coupons.length} coupons created successfully`,
      count: coupons.length,
      data: coupons,
    });
  }
);

/**
 * @desc    Cleanup expired coupons (Admin only)
 * @route   POST /api/coupons/cleanup
 * @access  Private/Admin
 */
export const cleanupExpiredCoupons = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const count = await couponService.cleanupExpiredCoupons();

    res.status(200).json({
      success: true,
      message: `${count} expired coupons deactivated`,
      count,
    });
  }
);
