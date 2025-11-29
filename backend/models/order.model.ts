import mongoose, { Schema } from 'mongoose';
import { IOrderDocument, OrderStatus } from '../types/order.types';

const orderSchema = new Schema<IOrderDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1']
        },
        price: {
          type: Number,
          required: true,
          min: [0, 'Price cannot be negative']
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true // Allows multiple null values
    },
    couponCode: {
      type: String,
      uppercase: true
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: Object.values(OrderStatus),
        message: '{VALUE} is not a valid order status'
      },
      default: OrderStatus.PENDING,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ stripeSessionId: 1 });

orderSchema.virtual('finalAmount').get(function() {
  return this.totalAmount - (this.discountAmount || 0);
});

const Order = mongoose.model<IOrderDocument>('Order', orderSchema);

export default Order;