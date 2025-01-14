import { Router, Response } from "express";
import OpenAI from "openai";
import { Assistant } from "openai/resources/beta/assistants";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth.js";
import {
  getThreads,
  createNewThread,
  sendMessage,
  getThreadHistory,
  deleteThread,
} from "../controllers/chatController.js";
import {
  sendMessageValidator,
  threadHistoryValidator,
  deleteThreadValidator,
} from "../validators/chatValidators.js";

export function setupChatRoutes(
  router: Router,
  client: OpenAI,
  assistant: Assistant
): Router {
  // Apply authentication middleware to all routes
  router.use(authenticateUser);

  // Get user's chat threads
  router.get("/threads", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await getThreads(req, res);
      res.json(result);
    } catch (error) {
      console.error("Error fetching threads:", error);
      res.status(500).json({
        error: "Failed to fetch chat threads",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Create a new chat thread
  router.post("/thread", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await createNewThread(client, req.user?.walletAddress!);
      res.json(result);
    } catch (error) {
      console.error("Error creating thread:", error);
      res.status(500).json({
        error: "Failed to create chat thread",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Send a message and get a response
  router.post(
    "/message",
    sendMessageValidator,
    async (req: AuthenticatedRequest, res: Response) => {
      const abortController = new AbortController();

      // Handle client disconnection
      req.on("close", () => {
        abortController.abort();
      });

      try {
        const { message, threadId } = req.body;
        const result = await sendMessage(
          client,
          assistant,
          req.user?.walletAddress!,
          message,
          threadId,
          abortController.signal
        );
        res.json(result);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return res.status(499).json({ error: "Request cancelled by client" });
        }
        console.error("Error processing message:", error);
        res.status(500).json({
          error: "Failed to process message",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Get thread history
  router.get(
    "/history/:threadId",
    threadHistoryValidator,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const result = await getThreadHistory(
          req.user?.walletAddress!,
          req.params.threadId
        );
        res.json(result);
      } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({
          error: "Failed to fetch chat history",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Delete a thread
  router.delete(
    "/thread/:threadId",
    deleteThreadValidator,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const result = await deleteThread(
          client,
          req.user?.walletAddress!,
          req.params.threadId
        );
        res.json(result);
      } catch (error) {
        console.error("Error deleting thread:", error);
        res.status(500).json({
          error: "Failed to delete thread",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  return router;
}
