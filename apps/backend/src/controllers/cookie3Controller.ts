import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth/index.js";
import { APIError, ErrorCode } from "../middleware/errors/types.js";
import { getTopAgents } from "@repo/brainpower-agent";

export const getPagedAgents = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const interval = (req.query.interval as "_3Days" | "_7Days") || "_7Days";

  try {
    const response = await getTopAgents(page, pageSize, interval);
    res.json(response);
  } catch (error) {
    throw new APIError(
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : "Failed to fetch agents"
    );
  }
};
