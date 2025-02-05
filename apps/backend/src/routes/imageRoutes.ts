import { Router } from "express";
import { authenticateUser } from "../middleware/auth/index.js";
import { validateCluster } from "../middleware/auth/cluster.js";
import {
  generateImage,
  imageGenerationLimiter,
} from "../controllers/imageController.js";
import { asyncHandler } from "../middleware/errors/asyncHandler.js";

export function setupImageRoutes(router: Router): Router {
  router.use(authenticateUser);
  router.use(validateCluster);

  router.post("/generate", imageGenerationLimiter, asyncHandler(generateImage));

  return router;
}
