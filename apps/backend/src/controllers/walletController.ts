import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { BadRequestError } from "../middleware/errors/types.js";
import { User } from "../models/User.js";

export const storeWallet = async (req: AuthenticatedRequest, res: Response) => {
  const { address, chainType = "solana" } = req.body;
  const userId = req.user?.userId;

  if (!address || !chainType) {
    throw new BadRequestError("Address and chain type are required");
  }

  if (!userId) {
    throw new BadRequestError("User not authenticated");
  }

  await User.findOneAndUpdate(
    { userId },
    {
      $push: {
        wallets: {
          address,
          chainType,
          isActive: true,
        },
      },
    },
    { upsert: true }
  );

  return {
    address,
    chainType,
  };
};

export const getUserWallets = async (req: AuthenticatedRequest) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new BadRequestError("User not authenticated");
  }

  const user = await User.findOne({ userId });
  return {
    wallets: user?.wallets || [],
  };
};
