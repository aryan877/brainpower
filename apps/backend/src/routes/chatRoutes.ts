import { Router } from "express";
import OpenAI from "openai";
import { authenticateUser } from "../middleware/auth.js";
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

export function setupChatRoutes(router: Router, client: OpenAI): Router {
  router.use(authenticateUser);

  router.get("/threads", asyncHandler(getThreads));

  router.post(
    "/thread",
    asyncHandler((req, res) => createNewThread(req, res, client))
  );

  router.post(
    "/message",
    validateSendMessage,
    asyncHandler(async (req, res) => {
      const assistant = await client.beta.assistants.create({
        name: "Brainpower AI",
        instructions:
          "You are Brainpower AI, a helpful assistant that helps users understand and interact with blockchain technology, specifically Solana.",
        model: "gpt-4-turbo-preview",
      });

      await sendMessage(req, res, client, assistant);

      // Cleanup assistant after use
      await client.beta.assistants.del(assistant.id);
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
    asyncHandler((req, res) => deleteThread(req, res, client))
  );

  return router;
}
