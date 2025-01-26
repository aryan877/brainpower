import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth/index.js";
import { BadRequestError } from "../middleware/errors/types.js";
import { User } from "../models/User.js";
import { getUserId } from "../utils/userIdentification.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { getRpcUrl } from "../utils/getRpcUrl.js";

export const storeWallet = async (req: AuthenticatedRequest, res: Response) => {
  const { address, chainType = "solana" } = req.body;
  const userId = getUserId(req);

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
  const userId = getUserId(req);
  const user = await User.findOne({ userId });

  res.json({
    wallets: user?.wallets || [],
  });
};

export const getBalance = async (req: AuthenticatedRequest, res: Response) => {
  const { address } = req.query;
  const cluster = req.user.cluster;

  if (!address || typeof address !== "string") {
    throw new BadRequestError("Address is required");
  }

  try {
    const rpcUrl = getRpcUrl(cluster);
    const connection = new Connection(rpcUrl, "confirmed");
    const pubkey = new PublicKey(address);
    const balance = await connection.getBalance(pubkey);

    res.json({ balance });
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw new BadRequestError("Failed to fetch balance");
  }
};