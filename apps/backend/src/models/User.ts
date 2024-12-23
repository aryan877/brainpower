import mongoose from "mongoose";

export interface IUser {
  walletAddress: string;
  username?: string;
  nonce?: string; // Optional: only present during auth flow
  nonceTimestamp?: Date; // Optional: only present during auth flow
  signature?: string; // For subsequent auth verification
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      sparse: true,
      unique: true,
    },
    nonce: {
      type: String,
      required: false, // Changed to false since it's only needed during auth
    },
    nonceTimestamp: {
      type: Date,
      required: false, // Changed to false since it's only needed during auth
    },
    signature: {
      type: String,
      required: false, // Present after successful auth
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLoginAt: -1 });

export const User = mongoose.model<IUser>("User", userSchema);
