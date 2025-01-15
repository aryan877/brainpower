import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./index.js";
import { BadRequestError } from "../errors/types.js";

export const validateCluster = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const cluster = req.headers["x-solana-cluster"] as "mainnet-beta" | "devnet";

  if (!cluster || !["mainnet-beta", "devnet"].includes(cluster)) {
    throw new BadRequestError(
      "Invalid or missing Solana cluster",
      "Cluster must be either 'mainnet-beta' or 'devnet'"
    );
  }

  if (req.user) {
    req.user.cluster = cluster;
  }

  next();
};
