import { Request, Response, NextFunction } from "express";
import { privyClient } from "../../lib/privyClient.js";
import { UnauthorizedError } from "../errors/types.js";
import { SOLANA_CAIP2 } from "./cluster.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    walletAddress?: string;
    cluster?: "mainnet-beta" | "devnet";
    caip2?: (typeof SOLANA_CAIP2)[keyof typeof SOLANA_CAIP2];
  };
}

export async function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const requestId = crypto.randomUUID();
  console.log(`[Auth ${requestId}] Authentication attempt started`, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  try {
    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;
    console.log(
      `[Auth ${requestId}] Authorization header present: ${!!authHeader}`
    );

    if (!authHeader?.startsWith("Bearer ")) {
      // Check for cookie-based tokens if header is not present
      const accessToken = req.cookies["privy-token"];
      const idToken = req.cookies["privy-id-token"];
      console.log(
        `[Auth ${requestId}] Using cookie auth. Access token present: ${!!accessToken}, ID token present: ${!!idToken}`
      );

      if (!accessToken) {
        console.log(
          `[Auth ${requestId}] Authentication failed - No token provided`
        );
        throw new UnauthorizedError("No authentication token provided");
      }

      // Verify the access token
      console.log(`[Auth ${requestId}] Verifying access token`);
      const verifiedClaims = await privyClient.verifyAuthToken(accessToken);
      console.log(
        `[Auth ${requestId}] Token verified successfully for user: ${verifiedClaims.userId}`
      );

      // Get user details from identity token if available
      if (idToken) {
        try {
          console.log(
            `[Auth ${requestId}] Fetching user details with ID token`
          );
          const user = await privyClient.getUser({ idToken });
          req.user = {
            userId: verifiedClaims.userId,
            walletAddress: user.wallet?.address,
          };
          console.log(`[Auth ${requestId}] User details fetched successfully`, {
            userId: verifiedClaims.userId,
            hasWallet: !!user.wallet?.address,
          });
        } catch (error) {
          console.error(
            `[Auth ${requestId}] Error getting user details from identity token:`,
            {
              error: error instanceof Error ? error.message : String(error),
              userId: verifiedClaims.userId,
            }
          );
          req.user = {
            userId: verifiedClaims.userId,
          };
        }
      } else {
        console.log(
          `[Auth ${requestId}] No ID token present, setting basic user info`
        );
        req.user = {
          userId: verifiedClaims.userId,
        };
      }

      console.log(`[Auth ${requestId}] Authentication successful`, {
        userId: req.user.userId,
        hasWallet: !!req.user.walletAddress,
      });
      next();
      return;
    }

    // Extract and verify the token from header
    const token = authHeader.split(" ")[1];
    console.log(`[Auth ${requestId}] Verifying bearer token`);
    const verifiedClaims = await privyClient.verifyAuthToken(token);

    req.user = {
      userId: verifiedClaims.userId,
    };

    console.log(`[Auth ${requestId}] Bearer token authentication successful`, {
      userId: verifiedClaims.userId,
    });
    next();
  } catch (error) {
    console.error(`[Auth ${requestId}] Authentication failed`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    next(new UnauthorizedError("Invalid authentication token"));
  }
}
