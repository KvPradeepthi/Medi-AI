import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otpHash: string;
  purpose: "login" | "register" | "reset-password";
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  createdAt: Date;
}

const OtpSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["login", "register", "reset-password"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // MongoDB TTL index: document automatically deleted after 10 minutes (600 seconds)
    },
  },
  { timestamps: true }
);

OtpSchema.index({ email: 1, purpose: 1 });

export default mongoose.model<IOtp>("Otp", OtpSchema);
