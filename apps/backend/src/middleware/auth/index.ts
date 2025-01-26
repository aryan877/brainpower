import { Request, Response, NextFunction } from "express";
import { privyClient } from "../../lib/privyClient.js";
import { UnauthorizedError } from "../errors/types.js";
import { SOLANA_CAIP2 } from "./cluster.js";
import { Cluster } from "@repo/brainpower-agent";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    walletAddress?: string;
    cluster?: Cluster;
    caip2?: (typeof SOLANA_CAIP2)[keyof typeof SOLANA_CAIP2];
  };
}

export async function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      const accessToken = req.cookies["privy-token"];
      const idToken = req.cookies["privy-id-token"];

      if (!accessToken) {
        throw new UnauthorizedError("No authentication token provided");
      }

      const verifiedClaims = await privyClient.verifyAuthToken(accessToken);

      if (idToken) {
        try {
          const user = await privyClient.getUser({ idToken });
          req.user = {
            userId: verifiedClaims.userId,
            walletAddress: user.wallet?.address,
          };
        } catch (error) {
          req.user = {
            userId: verifiedClaims.userId,
          };
        }
      } else {
        req.user = {
          userId: verifiedClaims.userId,
        };
      }

      next();
      return;
    }

    const token = authHeader.split(" ")[1];
    const verifiedClaims = await privyClient.verifyAuthToken(token);

    req.user = {
      userId: verifiedClaims.userId,
    };

    next();
  } catch (error) {
    next(new UnauthorizedError("Invalid authentication token"));
  }
}
