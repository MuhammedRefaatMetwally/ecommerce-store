import mongoose, { Schema } from 'mongoose';
import { IProductDocument, ProductCategory } from '../types/product.types';

const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
      maxlength: [100, 'Product name cannot exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: (value: number) => Number.isFinite(value),
        message: 'Price must be a valid number',
      },
    },
    image: {
      type: String,
      required: [true, 'Product image is required'],
      validate: {
        validator: (value: string) => {
          return value.startsWith('http://') || value.startsWith('https://');
        },
        message: 'Image must be a valid URL',
      },
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: {
        values: Object.values(ProductCategory),
        message: '{VALUE} is not a valid category',
      },
      lowercase: true,
      trim: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for better query performance
productSchema.index({ category: 1, isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for formatted price not in the database
productSchema.virtual('formattedPrice').get(function () {
  return `$${this.price.toFixed(2)}`;
});

const Product = mongoose.model<IProductDocument>('Product', productSchema);

export default Product;
