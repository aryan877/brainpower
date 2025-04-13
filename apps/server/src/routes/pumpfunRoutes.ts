import { Router } from "express";
import { authenticateUser } from "../middleware/auth/index.js";
import { validateCluster } from "../middleware/auth/cluster.js";
import { getBundleAnalysis } from "../controllers/pumpfunController.js";
import { validateGetBundleAnalysis } from "../validators/pumpfunValidators.js";
import { asyncHandler } from "../middleware/errors/asyncHandler.js";

export function setupPumpfunRoutes(router: Router): Router {
  router.use(authenticateUser);
  router.use(validateCluster);

  // Get bundle analysis for a token
  router.get(
    "/bundle-analysis",
    validateGetBundleAnalysis,
    asyncHandler(getBundleAnalysis)
  );

  return router;
}
