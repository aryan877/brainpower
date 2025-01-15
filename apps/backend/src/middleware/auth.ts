import { Request, Response, NextFunction } from "express";
import { privyClient } from "../lib/privyClient.js";
import { UnauthorizedError } from "./errors/types.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    walletAddress?: string;
  };
}

export async function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      // Check for cookie-based tokens if header is not present
      const accessToken = req.cookies["privy-token"];
      const idToken = req.cookies["privy-id-token"];

      if (!accessToken) {
        throw new UnauthorizedError("No authentication token provided");
      }

      // Verify the access token
      const verifiedClaims = await privyClient.verifyAuthToken(accessToken);

      // Get user details from identity token if available
      if (idToken) {
        try {
          const user = await privyClient.getUser({ idToken });
          req.user = {
            userId: verifiedClaims.userId,
            walletAddress: user.wallet?.address,
          };
        } catch (error) {
          console.error(
            "Error getting user details from identity token:",
            error
          );
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

    // Extract and verify the token from header
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
