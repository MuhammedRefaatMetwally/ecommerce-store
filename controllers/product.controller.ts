import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Private/Admin
 */
export const getAllProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const filters = req.query;
    const products = await productService.getAllProducts(filters);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  }
);

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
export const getFeaturedProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const products = await productService.getFeaturedProducts();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  }
);

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await productService.getProductById(req.params.id);

    res.status(200).json({
      success: true,
      data: product,
    });
  }
);

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  }
);

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await productService.updateProduct(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  }
);

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await productService.deleteProduct(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: null,
    });
  }
);

/**
 * @desc    Toggle product featured status
 * @route   PATCH /api/products/:id/featured
 * @access  Private/Admin
 */
export const toggleFeaturedProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await productService.toggleFeaturedProduct(req.params.id);

    res.status(200).json({
      success: true,
      message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: product,
    });
  }
);

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:category
 * @access  Public
 */
export const getProductsByCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const products = await productService.getProductsByCategory(
      req.params.category
    );

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  }
);

/**
 * @desc    Get recommended products
 * @route   GET /api/products/recommendations
 * @access  Public
 */
export const getRecommendedProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 3;
    const products = await productService.getRecommendedProducts(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  }
);
