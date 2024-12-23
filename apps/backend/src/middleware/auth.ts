import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import tweetnaclUtil from "tweetnacl-util";

const { decodeUTF8 } = tweetnaclUtil;

export interface AuthenticatedRequest extends Request {
  user?: {
    walletAddress: string;
    username?: string;
    signature?: string;
  };
}

// Verify middleware
export async function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    // Extract wallet address and signature
    const [walletAddress, signature] = authHeader.split(" ");
    if (!walletAddress || !signature) {
      return res.status(401).json({ error: "Invalid authorization format" });
    }

    // Find user
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // If user has a stored signature, verify against that first
    if (user.signature === signature) {
      req.user = {
        walletAddress: user.walletAddress,
        username: user.username,
        signature: user.signature,
      };
      return next();
    }

    // If signature doesn't match stored one, check if we're in the nonce verification flow
    if (!user.nonce) {
      return res.status(401).json({
        error:
          "Invalid signature and no active nonce. Please request a new nonce.",
      });
    }

    // Check if nonce is expired (5 minutes)
    const nonceAge = Date.now() - (user.nonceTimestamp?.getTime() || 0);
    if (nonceAge > 5 * 60 * 1000) {
      // Clear expired nonce
      await User.findOneAndUpdate(
        { walletAddress },
        { $unset: { nonce: "", nonceTimestamp: "" } }
      );
      return res.status(401).json({
        error: "Nonce expired. Please request a new one.",
      });
    }

    try {
      const message = `Sign this message to authenticate with your wallet: ${user.nonce}`;
      const messageBytes = decodeUTF8(message);
      const signatureBytes = bs58.decode(signature);
      const publicKey = new PublicKey(walletAddress);

      const isValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey.toBytes()
      );

      if (!isValid) {
        return res.status(401).json({ error: "Invalid signature" });
      }

      // Update user with new signature and clear nonce
      await User.findOneAndUpdate(
        { walletAddress },
        {
          signature,
          lastLoginAt: new Date(),
          $unset: { nonce: "", nonceTimestamp: "" },
        }
      );

      req.user = {
        walletAddress: user.walletAddress,
        username: user.username,
        signature,
      };

      next();
    } catch (error) {
      console.error("Signature verification error:", error);
      return res.status(401).json({
        error: "Invalid signature",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      error: "Authentication failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
