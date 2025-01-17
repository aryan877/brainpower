import { Response } from "express";
import { ChatThread } from "../models/ChatThread.js";
import { AuthenticatedRequest } from "../middleware/auth/index.js";
import { NotFoundError, DatabaseError } from "../middleware/errors/types.js";
import { getUserCluster, getUserId } from "../utils/userIdentification.js";
import { createSolanaTools } from "brainpower-agent";
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

  const chatThread = await ChatThread.findOne({
    threadId,
    userId,
    isActive: true,
  });

  if (!chatThread) {
    throw new NotFoundError("Thread not found");
  }

  // Update title if first message
  if (chatThread.messages.length === 0 && messages.length > 0) {
    const firstMessage = messages[messages.length - 1];
    if (firstMessage.role === "user") {
      chatThread.title = firstMessage.content.slice(0, 100);
      await chatThread.save();
    }
  }

  // Set headers for streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // Ensure headers are sent immediately

  try {
    // Generate BrainPower agent for this user
    const agent = generateBrainpowerAgent({
      walletId: req.user?.walletAddress || "",
      cluster: cluster,
    });

    const tools = createSolanaTools(agent);

    const result = streamText({
      model: openai("gpt-4o"),
      messages: messages,
      experimental_toolCallStreaming: true,
      maxSteps: 5,
      system: assistantPrompt,
      tools,
      experimental_transform: smoothStream({
        chunking: "word",
        delayInMs: 15,
      }),
    });

    try {
      // Handle all stream events
      for await (const event of result.fullStream) {
        switch (event.type) {
          case "text-delta":
            // Send text delta with '0:' prefix
            res.write(`0:${JSON.stringify(event.textDelta)}\n`);
            break;
          case "tool-call":
            // Send tool call with '9:' prefix
            res.write(
              `9:${JSON.stringify({
                toolCallId: event.toolCallId,
                toolName: event.toolName,
                args: event.args,
              })}\n`
            );
            break;
          case "tool-result":
            // Send tool result with 'a:' prefix
            res.write(
              `a:${JSON.stringify({
                toolCallId: event.toolCallId,
                result: event.result,
              })}\n`
            );
            break;
          case "error":
            // Send error with 'e:' prefix
            res.write(
              `e:${JSON.stringify({
                finishReason: "error",
                error: event.error,
                isContinued: false,
              })}\n`
            );
            break;
        }
      }

      // Get final completion info
      const [usage, finishReason] = await Promise.all([
        result.usage,
        result.finishReason,
      ]);

      // Send completion event
      const completion = {
        finishReason,
        usage,
        isContinued: false,
      };

      // Send event completion and done markers
      res.write(`e:${JSON.stringify(completion)}\n`);
      res.write(`d:${JSON.stringify({ finishReason, usage })}\n`);

      // Save messages to thread
      const finalText = await result.text;
      const toolCalls = await result.toolCalls;
      const toolResults = await result.toolResults;

      // Update thread with new messages
      chatThread.messages.push(...messages);
      if (finalText) {
        chatThread.messages.push({
          role: "assistant",
          content: finalText,
          toolCalls,
          toolResults,
        });
      }
      await chatThread.save();
    } catch (streamError) {
      console.error("Stream error:", streamError);
      const errorCompletion = {
        finishReason: "error",
        usage: null,
        isContinued: false,
      };
      res.write(`e:${JSON.stringify(errorCompletion)}\n`);
      res.write(
        `d:${JSON.stringify({ finishReason: "error", usage: null })}\n`
      );
    } finally {
      res.end();
    }
  } catch (error) {
    console.error("Error in chat:", error);
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

  chatThread.isActive = false;
  await chatThread.save();

  res.json({ message: "Thread deleted successfully" });
};
