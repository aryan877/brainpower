import { Router } from "express";
import { authenticateUser } from "../middleware/auth/index.js";
import { validateCluster } from "../middleware/auth/cluster.js";
import { getPagedAgents } from "../controllers/cookie3Controller.js";
import { validateGetPagedAgents } from "../validators/cookie3Validators.js";
import { asyncHandler } from "../middleware/errors/asyncHandler.js";

export function setupCookie3Routes(router: Router): Router {
  router.use(authenticateUser);
  router.use(validateCluster);

  // Get paged list of top agents with pagination data
  router.get("/agents", validateGetPagedAgents, asyncHandler(getPagedAgents));

  return router;
}
