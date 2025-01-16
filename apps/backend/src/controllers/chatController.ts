import { Response } from "express";
import { ChatThread } from "../models/ChatThread.js";
import { AuthenticatedRequest } from "../middleware/auth/index.js";
import { NotFoundError, DatabaseError } from "../middleware/errors/types.js";
import { getUserCluster, getUserId } from "../utils/userIdentification.js";
import { createSolanaTools } from "brainpower-agent";
// import { streamText } from "ai";
import { generateBrainpowerAgent } from "../utils/generateBrainpowerAgent.js";
import OpenAI from "openai";
import { config } from "dotenv";

config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  const cluster = getUserCluster(req);
  const thread = await openai.beta.threads.create();

  if (!thread?.id) {
    throw new Error("Failed to create OpenAI thread");
  }

  const chatThread = await ChatThread.create({
    userId,
    threadId: thread.id,
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
  const { message, threadId } = req.body;

  const chatThread = await ChatThread.findOne({
    threadId,
    userId,
    isActive: true,
  });

  if (!chatThread) {
    throw new NotFoundError("Thread not found");
  }

  // Update title if first message
  if (chatThread.messages.length === 0) {
    chatThread.title = message.slice(0, 100);
    await chatThread.save();
  }

  // Set up SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // Generate BrainPower agent for this user
    const agent = generateBrainpowerAgent({
      walletId: req.user?.walletAddress || "",
      cluster: cluster,
    });

    const tools = createSolanaTools(agent);

    // Create a completion using OpenAI directly
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        ...chatThread.messages.map((msg) => ({
          role: msg.role as any,
          content: msg.content,
        })),
        { role: "user", content: message },
      ],
      stream: true,
    });

    let fullResponse = "";
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullResponse += content;
      res.write(`data: ${JSON.stringify({ type: "token", content })}\n\n`);
    }

    // Save message to database
    chatThread.messages.push(
      { role: "user", content: message, createdAt: new Date() },
      { role: "assistant", content: fullResponse, createdAt: new Date() }
    );
    await chatThread.save();

    // End the stream
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Error in chat stream:", error);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        error: "Failed to process message",
      })}\n\n`
    );
    res.end();
    throw new DatabaseError("Failed to process message", error);
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

  const chatThread = await ChatThread.findOne({
    threadId,
    userId,
  });

  if (!chatThread) {
    throw new NotFoundError("Thread not found");
  }

  try {
    await openai.beta.threads.del(threadId);
  } catch (error) {
    console.error("Error deleting OpenAI thread:", error);
    // Continue even if OpenAI deletion fails
  }

  chatThread.isActive = false;
  await chatThread.save();

  res.json({ message: "Thread deleted successfully" });
};
