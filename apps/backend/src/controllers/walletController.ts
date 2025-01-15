import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { BadRequestError } from "../middleware/errors/types.js";
import { User } from "../models/User.js";
import { getUserId } from "../utils/userIdentification.js";

export const storeWallet = async (req: AuthenticatedRequest, res: Response) => {
  const { address, chainType = "solana" } = req.body;
  const userId = await getUserId(req);

  if (!address || !chainType) {
    throw new BadRequestError("Address and chain type are required");
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

  res.json({
    address,
    chainType,
  });
};

export const getUserWallets = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = await getUserId(req);
  const user = await User.findOne({ userId });

  res.json({
    wallets: user?.wallets || [],
  });
};
