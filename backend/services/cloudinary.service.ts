import cloudinary from '../lib/cloudinary';
import { ICloudinaryUploadResult } from '../types/product.types';
import { AppError } from '../utils/appError';

export class CloudinaryService {
 
  async uploadImage(
    imageData: string,
    folder: string = 'products'
  ): Promise<ICloudinaryUploadResult> {
    try {
      const result = await cloudinary.uploader.upload(imageData, {
        folder,
        resource_type: 'auto',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });

      return {
        secure_url: result.secure_url,
        public_id: result.public_id
      };
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw new AppError('Failed to upload image', 500);
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const publicId = this.extractPublicId(imageUrl);
      if (!publicId) {
        console.warn('Could not extract public_id from URL:', imageUrl);
        return;
      }

      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
    }
  }


  private extractPublicId(url: string): string | null {
    try {
      // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/products/abc123.jpg
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      
      if (uploadIndex === -1 || uploadIndex + 2 >= parts.length) {
        return null;
      }

      // Get everything after 'upload/v1234567890/'
      const pathParts = parts.slice(uploadIndex + 2);
      const fullPath = pathParts.join('/');
      
      // Remove file extension  Regex removes .jpg, .png, .webp, or any extension.
      return fullPath.replace(/\.[^/.]+$/, '');
    } catch (error) {
      console.error('Error extracting public_id:', error);
      return null;
    }
  }


  async deleteImages(imageUrls: string[]): Promise<void> {
    const deletePromises = imageUrls.map(url => this.deleteImage(url));
    await Promise.allSettled(deletePromises);
  }
}

export const cloudinaryService = new CloudinaryService();