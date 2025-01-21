import { Response } from "express";
import { ChatThread } from "../models/ChatThread.js";
import { AuthenticatedRequest } from "../middleware/auth/index.js";
import { NotFoundError } from "../middleware/errors/types.js";
import { getUserCluster, getUserId } from "../utils/userIdentification.js";
import { createSolanaTools } from "@repo/brainpower-agent";
import { streamText, smoothStream } from "ai";
import { generateBrainpowerAgent } from "../utils/generateBrainpowerAgent.js";
import { assistantPrompt } from "../const/prompt.js";
import { openai } from "@ai-sdk/openai";
import { nanoid } from "nanoid";

export const getThreads = async (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const threads = await ChatThread.find(
    { userId, isActive: true },
    { threadId: 1, createdAt: 1, updatedAt: 1, title: 1 }
  ).sort({ updatedAt: -1 });

  res.json({ threads });
};

export const createNewThread = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = getUserId(req);
  const threadId = `thread_${nanoid()}`;

  const chatThread = await ChatThread.create({
    userId,
    threadId,
    messages: [],
  });

  res.json({
    threadId: chatThread.threadId,
    createdAt: chatThread.createdAt,
  });
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const cluster = getUserCluster(req);
  const { messages, threadId } = req.body;

  try {
    const chatThread = await ChatThread.findOne({
      threadId,
      userId,
      isActive: true,
    });

    if (!chatThread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    // Update title if first message
    if (chatThread.messages.length === 1 && messages.length > 0) {
      const firstMessage = messages[messages.length - 1];
      if (firstMessage.role === "user") {
        chatThread.title = firstMessage.content.slice(0, 100);
        await chatThread.save();
      }
    }

    const agent = generateBrainpowerAgent({
      walletId: req.user?.walletAddress || "",
      cluster: cluster,
    });

    const tools = createSolanaTools(agent);

    // Set headers before any potential errors
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      experimental_toolCallStreaming: true,
      maxSteps: 5,
      system: assistantPrompt,
      tools,
      experimental_transform: smoothStream({
        chunking: "word",
        delayInMs: 15,
      }),
    });

    const streamResponse = result.toDataStreamResponse();

    const stream = streamResponse.body;
    if (!stream) {
      throw new Error("No stream available");
    }

    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          break;
        }
        res.write(value);
      }
    } catch (error) {
      reader.releaseLock();
      console.error("Stream error:", error);
      res.end();
    }
  } catch (error) {
    if (!res.headersSent) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred" });
      }
    }
  }
};

export const getThreadHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = getUserId(req);
  const threadId = req.params.threadId;

  const chatThread = await ChatThread.findOne({
    threadId,
    userId,
    isActive: true,
  });

  if (!chatThread) {
    throw new NotFoundError("Thread not found");
  }

  res.json({
    threadId: chatThread.threadId,
    messages: chatThread.messages,
    createdAt: chatThread.createdAt,
    updatedAt: chatThread.updatedAt,
  });
};

export const deleteThread = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = getUserId(req);
  const threadId = req.params.threadId;

  const result = await ChatThread.findOneAndDelete({ threadId, userId });

  if (!result) {
    throw new NotFoundError("Thread not found");
  }

  res.json({ message: "Thread deleted successfully" });
};

export const saveAllMessages = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = getUserId(req);
  const { messages, threadId } = req.body;

  const chatThread = await ChatThread.findOne({
    threadId,
    userId,
    isActive: true,
  });

  if (!chatThread) {
    throw new NotFoundError("Thread not found");
  }

  // Replace all messages in the thread
  chatThread.messages = messages;
  await chatThread.save();

  res.json({
    success: true,
    threadId,
    messageCount: messages.length,
  });
};
