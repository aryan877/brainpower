import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./index.js";
import { BadRequestError } from "../errors/types.js";
import { SolanaCaip2ChainId } from "@privy-io/server-auth";

export const SOLANA_CAIP2 = {
  MAINNET: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" as SolanaCaip2ChainId,
  DEVNET: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1" as SolanaCaip2ChainId,
  TESTNET: "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z" as SolanaCaip2ChainId,
} as const;

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
    req.user.caip2 =
      cluster === "mainnet-beta" ? SOLANA_CAIP2.MAINNET : SOLANA_CAIP2.DEVNET;
  }

  next();
};
