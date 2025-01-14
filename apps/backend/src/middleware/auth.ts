import { Request, Response, NextFunction } from "express";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { config } from "dotenv";

config();

export interface AuthenticatedRequest extends Request {
  user?: {
    walletAddress: string;
  };
}

export function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Get the keypair from private key
    const privateKeyBytes = bs58.decode(process.env.PRIVATE_KEY_BASE58 || "");
    const keypair = Keypair.fromSecretKey(privateKeyBytes);
    const walletAddress = keypair.publicKey.toBase58();

    req.user = {
      walletAddress,
    };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      error: "Authentication failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
