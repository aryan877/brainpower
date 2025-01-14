import { Response } from "express";
import OpenAI from "openai";
import { Assistant } from "openai/resources/beta/assistants";
import { createThread } from "../core/createThread.js";
import { createRun } from "../core/createRun.js";
import { performRun } from "../core/performRun.js";
import { ChatThread } from "../models/ChatThread.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { NotFoundError } from "../middleware/errors/types.js";

export const getThreads = async (req: AuthenticatedRequest, res: Response) => {
  const threads = await ChatThread.find(
    { userId: req.user?.walletAddress, isActive: true },
    { threadId: 1, createdAt: 1, updatedAt: 1, title: 1 }
  ).sort({ updatedAt: -1 });

  return { threads };
};

export const createNewThread = async (client: OpenAI, userId: string) => {
  const openAiThread = await createThread(client);
  if (!openAiThread?.id) {
    throw new Error("Failed to create OpenAI thread");
  }

  const chatThread = await ChatThread.create({
    userId,
    threadId: openAiThread.id,
    messages: [],
  });

  return {
    threadId: chatThread.threadId,
    createdAt: chatThread.createdAt,
  };
};

export const sendMessage = async (
  client: OpenAI,
  assistant: Assistant,
  userId: string,
  message: string,
  threadId: string,
  abortSignal?: AbortSignal
) => {
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

  // Verify OpenAI thread
  const openAiThread = await client.beta.threads.retrieve(threadId);
  if (!openAiThread?.id) {
    throw new NotFoundError("OpenAI thread not found");
  }

  // Add user message
  await client.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });

  chatThread.messages.push({
    role: "user",
    content: message,
    createdAt: new Date(),
  });

  // Create and perform run
  const run = await createRun(client, openAiThread, assistant.id);
  const result = await performRun(run, client, openAiThread, abortSignal);

  if (result?.type === "text") {
    chatThread.messages.push({
      role: "assistant",
      content: result.text.value,
      createdAt: new Date(),
    });
    await chatThread.save();

    return {
      response: result.text.value,
      threadId: chatThread.threadId,
    };
  }

  throw new Error("No valid response generated");
};

export const getThreadHistory = async (userId: string, threadId: string) => {
  const chatThread = await ChatThread.findOne({
    threadId,
    userId,
    isActive: true,
  });

  if (!chatThread) {
    throw new NotFoundError("Thread not found");
  }

  return {
    threadId: chatThread.threadId,
    messages: chatThread.messages,
    createdAt: chatThread.createdAt,
    updatedAt: chatThread.updatedAt,
  };
};

export const deleteThread = async (
  client: OpenAI,
  userId: string,
  threadId: string
) => {
  const chatThread = await ChatThread.findOne({
    threadId,
    userId,
  });

  if (!chatThread) {
    throw new NotFoundError("Thread not found");
  }

  try {
    await client.beta.threads.del(threadId);
  } catch (error) {
    console.error("Error deleting OpenAI thread:", error);
    // Continue even if OpenAI deletion fails
  }

  chatThread.isActive = false;
  await chatThread.save();

  return { message: "Thread deleted successfully" };
};
