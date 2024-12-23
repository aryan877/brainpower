import { Express, Request, Response } from "express";
import { User } from "../models/User.js";
import { randomBytes } from "crypto";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth.js";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import tweetnaclUtil from "tweetnacl-util";
import {
  nonceValidator,
  verifySignatureValidator,
  updateUsernameValidator,
} from "../validators/authValidators.js";

const { decodeUTF8 } = tweetnaclUtil;

export function setupAuthRoutes(app: Express) {
  // Get nonce for wallet signature
  app.post(
    "/api/auth/nonce",
    nonceValidator,
    async (req: Request, res: Response) => {
      try {
        const { walletAddress } = req.body;

        // Generate a random nonce
        const nonce = randomBytes(32).toString("base64");
        const nonceTimestamp = new Date();
        const message = `Sign this message to authenticate with your wallet: ${nonce}`;

        // Clear any existing signature and update/create user with new nonce
        await User.findOneAndUpdate(
          { walletAddress },
          {
            walletAddress,
            nonce,
            nonceTimestamp,
            $unset: { signature: "" },
          },
          { upsert: true }
        );

        res.json({
          message,
          nonce,
        });
      } catch (error) {
        console.error("Error generating nonce:", error);
        res.status(500).json({
          error: "Failed to generate nonce",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Verify signature and authenticate user
  app.post(
    "/api/auth/verify",
    verifySignatureValidator,
    async (req: Request, res: Response) => {
      try {
        const { walletAddress, signature } = req.body;

        // Find user and get their nonce
        const user = await User.findOne({ walletAddress });
        if (!user || !user.nonce) {
          return res.status(401).json({
            error: "No active nonce found. Please request a new one.",
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

          res.json({
            message: "Authentication successful",
            user: {
              walletAddress,
              signature,
            },
          });
        } catch (error) {
          console.error("Signature verification error:", error);
          return res.status(401).json({
            error: "Invalid signature",
            details: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } catch (error) {
        console.error("Error verifying signature:", error);
        res.status(500).json({
          error: "Failed to verify signature",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Update username (protected route)
  app.put(
    "/api/auth/username",
    authenticateUser,
    updateUsernameValidator,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { username } = req.body;
        const walletAddress = req.user?.walletAddress;

        // Check if username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser.walletAddress !== walletAddress) {
          return res.status(400).json({ error: "Username already taken" });
        }

        // Update username
        const user = await User.findOneAndUpdate(
          { walletAddress },
          { username },
          { new: true }
        );

        res.json({
          message: "Username updated successfully",
          user: {
            walletAddress: user?.walletAddress,
            username: user?.username,
          },
        });
      } catch (error) {
        console.error("Error updating username:", error);
        res.status(500).json({
          error: "Failed to update username",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Get user profile (protected route)
  app.get(
    "/api/auth/profile",
    authenticateUser,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const user = await User.findOne(
          { walletAddress: req.user?.walletAddress },
          { nonce: 0, nonceTimestamp: 0 }
        );

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        res.json({ user });
      } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({
          error: "Failed to fetch profile",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
}
