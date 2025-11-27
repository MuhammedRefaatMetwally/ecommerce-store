import mongoose, { Schema } from "mongoose";
import { ICouponDocument } from "../types/coupon.types";

const couponSchema = new Schema<ICouponDocument>(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Coupon code must be at least 3 characters"],
      maxlength: [20, "Coupon code cannot exceed 20 characters"],
      match: [
        /^[A-Z0-9]+$/,
        "Coupon code can only contain uppercase letters and numbers",
      ],
    },
    discountPercentage: {
      type: Number,
      required: [true, "Discount percentage is required"],
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
    expirationDate: {
      type: Date,
      required: [true, "Expiration date is required"],
      validate: {
        validator: function (value: Date) {
          if (!this.isModified("expirationDate")) return true;
          return value > new Date();
        },
        message: "Expiration date must be in the future",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    usageLimit: {
      type: Number,
      min: [1, "Usage limit must be at least 1"],
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },
    minimumPurchase: {
      type: Number,
      min: [0, "Minimum purchase cannot be negative"],
      default: 0,
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

couponSchema.index({ userId: 1, isActive: 1 });
couponSchema.index({ code: 1, isActive: 1 });

couponSchema.virtual("remainingUses").get(function () {
  if (!this.usageLimit) return Infinity;
  return Math.max(0, this.usageLimit - this.usedCount);
});

couponSchema.methods.isExpired = function (): boolean {
  return this.expirationDate < new Date();
};

couponSchema.methods.hasUsesRemaining = function (): boolean {
  if (!this.usageLimit) return true;
  return this.usedCount < this.usageLimit;
};

couponSchema.methods.incrementUsage = async function (): Promise<void> {
  this.usedCount += 1;

  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    this.isActive = false;
  }

  await this.save();
};

const Coupon = mongoose.model<ICouponDocument>("Coupon", couponSchema);

export default Coupon;
