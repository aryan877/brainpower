import { Request, Response, NextFunction } from "express";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

export interface AuthenticatedRequest extends Request {
  user?: {
    walletAddress: string;
  };
}

// Get the keypair from private key
const privateKeyBytes = bs58.decode(process.env.PRIVATE_KEY_BASE58 || "");
const keypair = Keypair.fromSecretKey(privateKeyBytes);
const walletAddress = keypair.publicKey.toBase58();

// Simple middleware that attaches the wallet address to the request
export async function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    req.user = {
      walletAddress,
    };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      error: "Authentication failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
