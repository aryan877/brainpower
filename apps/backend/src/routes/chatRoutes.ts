import { Router, Response } from "express";
import OpenAI from "openai";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth.js";
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
import { BadRequestError, DatabaseError } from "../middleware/errors/types.js";
import { asyncHandler } from "../middleware/errors/asyncHandler.js";

export function setupChatRoutes(router: Router, client: OpenAI): Router {
  // Apply authentication middleware to all routes
  router.use(authenticateUser);

  // Get user's chat threads
  router.get(
    "/threads",
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      const result = await getThreads(req, res);
      res.json(result);
    })
  );

  // Create a new chat thread
  router.post(
    "/thread",
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      const result = await createNewThread(client, req.user?.walletAddress!);
      res.json(result);
    })
  );

  // Send a message and get a response
  router.post(
    "/message",
    validateSendMessage,
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      const abortController = new AbortController();

      // Handle client disconnection
      req.on("close", () => {
        abortController.abort();
      });

      const { message, threadId } = req.body;

      // Create assistant for this request
      const assistant = await client.beta.assistants.retrieve(
        process.env.OPENAI_ASSISTANT_ID!
      );

      const result = await sendMessage(
        client,
        assistant,
        req.user?.walletAddress!,
        message,
        threadId,
        abortController.signal
      ).catch((error) => {
        if (error.name === "AbortError") {
          throw new BadRequestError("Request cancelled by client");
        }
        throw new DatabaseError("Failed to process message", error);
      });

      res.json(result);
    })
  );

  // Get thread history
  router.get(
    "/history/:threadId",
    validateThreadHistory,
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      const result = await getThreadHistory(
        req.user?.walletAddress!,
        req.params.threadId
      );
      res.json(result);
    })
  );

  // Delete a thread
  router.delete(
    "/thread/:threadId",
    validateDeleteThread,
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      const result = await deleteThread(
        client,
        req.user?.walletAddress!,
        req.params.threadId
      );
      res.json(result);
    })
  );

  return router;
}
