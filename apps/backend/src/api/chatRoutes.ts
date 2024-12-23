import { Router, Request, Response } from "express";
import OpenAI from "openai";
import { Assistant } from "openai/resources/beta/assistants";
import { createThread } from "../core/createThread.js";
import { createRun } from "../core/createRun.js";
import { performRun } from "../core/performRun.js";
import { ChatThread } from "../models/ChatThread.js";
import {
  sendMessageValidator,
  threadHistoryValidator,
  deleteThreadValidator,
} from "../validators/chatValidators.js";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth.js";

interface SendMessageRequest extends AuthenticatedRequest {
  body: {
    message: string;
    threadId: string;
  };
}

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
      const threads = await ChatThread.find(
        { userId: req.user?.walletAddress, isActive: true },
        { threadId: 1, createdAt: 1, updatedAt: 1, title: 1 }
      ).sort({ updatedAt: -1 });

      res.json({ threads });
    } catch (error) {
      console.error("Error fetching threads:", error);
      res.status(500).json({
        error: "Failed to fetch chat threads",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Create a new chat thread
  router.post("/thread", async (req: SendMessageRequest, res: Response) => {
    try {
      // Create OpenAI thread
      const openAiThread = await createThread(client);
      if (!openAiThread?.id) {
        throw new Error("Failed to create OpenAI thread");
      }

      // Create MongoDB thread
      const chatThread = await ChatThread.create({
        userId: req.user?.walletAddress,
        threadId: openAiThread.id,
        messages: [],
      });

      res.json({
        threadId: chatThread.threadId,
        createdAt: chatThread.createdAt,
      });
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
    async (req: SendMessageRequest, res: Response) => {
      let abortController: AbortController | null = null;

      try {
        const { message, threadId } = req.body;

        // Find the thread in MongoDB
        const chatThread = await ChatThread.findOne({
          threadId,
          userId: req.user?.walletAddress,
          isActive: true,
        });

        if (!chatThread) {
          return res.status(404).json({ error: "Thread not found" });
        }

        // Update title if this is the first message
        if (chatThread.messages.length === 0) {
          chatThread.title = message.slice(0, 100); // Limit title length to 100 chars
          await chatThread.save();
        }

        // Verify thread exists in OpenAI
        try {
          const openAiThread = await client.beta.threads.retrieve(threadId);
          if (!openAiThread?.id) {
            throw new Error("OpenAI thread not found");
          }
        } catch (error) {
          console.error("Error retrieving OpenAI thread:", error);
          return res.status(404).json({
            error: "Thread not found in OpenAI",
            details: error instanceof Error ? error.message : "Unknown error",
          });
        }

        // Add user message to OpenAI thread
        await client.beta.threads.messages.create(threadId, {
          role: "user",
          content: message,
        });

        // Save user message to MongoDB
        chatThread.messages.push({
          role: "user",
          content: message,
          createdAt: new Date(),
        });

        // Create and perform the run with abort signal
        const openAiThread = await client.beta.threads.retrieve(threadId);
        const run = await createRun(client, openAiThread, assistant.id);

        // Create new AbortController for this run
        abortController = new AbortController();

        // Handle client disconnection
        req.on("close", () => {
          if (abortController) {
            abortController.abort();
            abortController = null;
          }
        });

        const result = await performRun(
          run,
          client,
          openAiThread,
          abortController.signal
        );

        if (result?.type === "text") {
          // Save assistant's response to MongoDB
          chatThread.messages.push({
            role: "assistant",
            content: result.text.value,
            createdAt: new Date(),
          });
          await chatThread.save();

          res.json({
            response: result.text.value,
            threadId: chatThread.threadId,
          });
        } else {
          throw new Error("No valid response generated");
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return res.status(499).json({ error: "Request cancelled by client" });
        }
        console.error("Error processing message:", error);
        res.status(500).json({
          error: "Failed to process message",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        // Clean up abort controller
        if (abortController) {
          abortController = null;
        }
      }
    }
  );

  // Get thread history
  router.get(
    "/history/:threadId",
    threadHistoryValidator,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const chatThread = await ChatThread.findOne({
          threadId: req.params.threadId,
          userId: req.user?.walletAddress,
          isActive: true,
        });

        if (!chatThread) {
          return res.status(404).json({ error: "Thread not found" });
        }

        res.json({
          threadId: chatThread.threadId,
          messages: chatThread.messages,
          createdAt: chatThread.createdAt,
          updatedAt: chatThread.updatedAt,
        });
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
        const chatThread = await ChatThread.findOne({
          threadId: req.params.threadId,
          userId: req.user?.walletAddress,
        });

        if (!chatThread) {
          return res.status(404).json({ error: "Thread not found" });
        }

        try {
          // Delete thread from OpenAI
          await client.beta.threads.del(req.params.threadId);
        } catch (error) {
          console.error("Error deleting OpenAI thread:", error);
        }

        // Mark thread as inactive in database
        chatThread.isActive = false;
        await chatThread.save();

        res.json({ message: "Thread deleted successfully" });
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
