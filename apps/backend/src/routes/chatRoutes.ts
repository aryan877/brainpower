import { Router } from "express";
import OpenAI from "openai";
import { authenticateUser } from "../middleware/auth/index.js";
import { validateCluster } from "../middleware/auth/cluster.js";
import {
  getThreads,
  createNewThread,
  sendMessage,
  getThreadHistory,
  deleteThread,
} from "../controllers/chatController.js";
import {
  validateSendMessage,
  validateThreadHistory,
  validateDeleteThread,
} from "../validators/chatValidators.js";
import { asyncHandler } from "../middleware/errors/asyncHandler.js";

export function setupChatRoutes(router: Router): Router {
  router.use(authenticateUser);
  router.use(validateCluster);

  router.get("/threads", asyncHandler(getThreads));

  router.post(
    "/thread",
    asyncHandler((req, res) => createNewThread(req, res))
  );

  router.post(
    "/message",
    validateSendMessage,
    asyncHandler(async (req, res) => {
      await sendMessage(req, res);
    })
  );

  router.get(
    "/history/:threadId",
    validateThreadHistory,
    asyncHandler(getThreadHistory)
  );

  router.delete(
    "/thread/:threadId",
    validateDeleteThread,
    asyncHandler((req, res) => deleteThread(req, res))
  );

  return router;
}
