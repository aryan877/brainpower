import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth/index.js";
import { APIError, ErrorCode } from "../middleware/errors/types.js";
import { analyzePumpFunBundles } from "@repo/brainpower-agent";

export const getBundleAnalysis = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { mintAddress } = req.query;

  if (!mintAddress || typeof mintAddress !== "string") {
    throw new APIError(
      400,
      ErrorCode.VALIDATION_ERROR,
      "Missing or invalid mintAddress parameter"
    );
  }

  try {
    const response = await analyzePumpFunBundles(mintAddress);
    return response;
  } catch (error) {
    throw new APIError(
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : "Failed to fetch bundle analysis"
    );
  }
};
