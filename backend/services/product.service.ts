import Product from '../models/product.model';
import { redis } from '../lib/redis';
import { cloudinaryService } from './cloudinary.service';
import {
  ICreateProductDTO,
  IUpdateProductDTO,
  IProductDocument,
  IProductFilter
} from '../types/product.types';
import { AppError } from '../utils/appError';

const FEATURED_PRODUCTS_CACHE_KEY = 'featured_products';
const CACHE_TTL = 3600; // 1 hour

export class ProductService {

  async getAllProducts(filter: IProductFilter = {}): Promise<IProductDocument[]> {
    const query: any = {};

    if (filter.category) {
      query.category = filter.category;
    }

    if (filter.isFeatured !== undefined) {
      query.isFeatured = filter.isFeatured;
    }

    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      query.price = {};
      if (filter.minPrice !== undefined) query.price.$gte = filter.minPrice;
      if (filter.maxPrice !== undefined) query.price.$lte = filter.maxPrice;
    }

    return await Product.find(query).sort({ createdAt: -1 }).lean().exec();
  }

  
  async getFeaturedProducts(): Promise<IProductDocument[]> {
    try {
      // Try to get from cache
      const cached = await redis.get(FEATURED_PRODUCTS_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }

      const featuredProducts = await Product.find({ isFeatured: true })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      if (featuredProducts.length > 0) {
        await redis.set(
          FEATURED_PRODUCTS_CACHE_KEY,
          JSON.stringify(featuredProducts),
          'EX',
          CACHE_TTL
        );
      }

      return featuredProducts;
    } catch (error) {
      console.error('Error in getFeaturedProducts:', error);
      return await Product.find({ isFeatured: true }).lean().exec();
    }
  }

  async createProduct(productData: ICreateProductDTO): Promise<IProductDocument> {
    let imageUrl = '';

    // Upload image to Cloudinary if provided
    if (productData.image) {
      const uploadResult = await cloudinaryService.uploadImage(
        productData.image,
        'products'
      );
      imageUrl = uploadResult.secure_url;
    }

    const product = await Product.create({
      ...productData,
      image: imageUrl,
      isFeatured: false
    });

    return product;
  }

 
  async getProductById(id: string): Promise<IProductDocument> {
    const product = await Product.findById(id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  
  async updateProduct(
    id: string,
    updateData: IUpdateProductDTO
  ): Promise<IProductDocument> {
    const product = await this.getProductById(id);

    if (updateData.image && updateData.image !== product.image) {
      if (product.image) {
        await cloudinaryService.deleteImage(product.image);
      }

      const uploadResult = await cloudinaryService.uploadImage(
        updateData.image,
        'products'
      );
      updateData.image = uploadResult.secure_url;
    }

    Object.assign(product, updateData);
    await product.save();

    // Update cache if featured status changed
    if (updateData.isFeatured !== undefined) {
      await this.updateFeaturedProductsCache();
    }

    return product;
  }

 
  async deleteProduct(id: string): Promise<void> {
    const product = await this.getProductById(id);

    if (product.image) {
      await cloudinaryService.deleteImage(product.image);
    }

    await Product.findByIdAndDelete(id);

    if (product.isFeatured) {
      await this.updateFeaturedProductsCache();
    }
  }

  /**
   * Toggle featured status
   */
  async toggleFeaturedProduct(id: string): Promise<IProductDocument> {
    const product = await this.getProductById(id);

    product.isFeatured = !product.isFeatured;
    await product.save();

    await this.updateFeaturedProductsCache();

    return product;
  }

 
  async getProductsByCategory(category: string): Promise<IProductDocument[]> {
    return await Product.find({ category: category.toLowerCase() })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }


  async getRecommendedProducts(limit: number = 3): Promise<IProductDocument[]> {
    return await Product.aggregate([
      { $sample: { size: limit } },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
          category: 1
        }
      }
    ]);
  }

  
  private async updateFeaturedProductsCache(): Promise<void> {
    try {
      const featuredProducts = await Product.find({ isFeatured: true })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      await redis.set(
        FEATURED_PRODUCTS_CACHE_KEY,
        JSON.stringify(featuredProducts),
        'EX',
        CACHE_TTL
      );
    } catch (error) {
      console.error('Error updating featured products cache:', error);
    }
  }


  async clearFeaturedProductsCache(): Promise<void> {
    await redis.del(FEATURED_PRODUCTS_CACHE_KEY);
  }
}

export const productService = new ProductService();