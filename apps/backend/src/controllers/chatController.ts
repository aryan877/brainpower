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
  res.flushHeaders();

  try {
    const agent = generateBrainpowerAgent({
      walletId: req.user?.walletAddress || "",
      cluster: cluster,
    });

    const tools = createSolanaTools(agent);

    // Keep track of current message being built
    let currentAssistantMessage = {
      id: `msg_${nanoid()}`,
      role: "assistant" as const,
      content: "",
      toolCalls: [],
      toolResults: [],
      createdAt: new Date(),
      annotations: [],
      isLoading: false,
      toolInvocations: [],
    };

    const result = streamText({
      model: openai("gpt-4o"),
      messages, // messages from useChat already has full history
      experimental_toolCallStreaming: true,
      maxSteps: 5,
      system: assistantPrompt,
      tools,
      experimental_transform: smoothStream({
        chunking: "word",
        delayInMs: 15,
      }),
      // Save progress on each step
      onStepFinish: async ({ text, toolCalls, toolResults }) => {
        currentAssistantMessage.content = text;
        if (toolCalls) {
          currentAssistantMessage.toolInvocations = toolCalls.map((call) => ({
            toolCallId: call.toolCallId,
            toolName: call.toolName,
            args: call.args,
            state: "call",
            result: undefined,
          }));
        }
        if (toolResults) {
          currentAssistantMessage.toolInvocations =
            currentAssistantMessage.toolInvocations.map((call) => {
              const result = toolResults.find(
                (r) => r.toolCallId === call.toolCallId
              );
              return result
                ? {
                    ...call,
                    result: result.result,
                    state: "result",
                  }
                : call;
            });
        }

        // Update the current message in the messages array
        const messageIndex = messages.findIndex(
          (m) => m.id === currentAssistantMessage.id
        );
        if (messageIndex !== -1) {
          messages[messageIndex] = { ...currentAssistantMessage };
        }

        // Update the messages array with the current state
        await ChatThread.findOneAndUpdate(
          { threadId, userId, isActive: true },
          { $set: { messages } },
          { new: true }
        );
      },
      // Final save on completion
      onFinish: async ({ text, toolCalls, toolResults }) => {
        currentAssistantMessage.content = text;
        if (toolCalls) {
          currentAssistantMessage.toolInvocations = toolCalls.map((call) => ({
            toolCallId: call.toolCallId,
            toolName: call.toolName,
            args: call.args,
            state: "call",
            result: undefined,
          }));
        }
        if (toolResults) {
          currentAssistantMessage.toolInvocations =
            currentAssistantMessage.toolInvocations.map((call) => {
              const result = toolResults.find(
                (r) => r.toolCallId === call.toolCallId
              );
              return result
                ? {
                    ...call,
                    result: result.result,
                    state: "result",
                  }
                : call;
            });
        }

        // Update the current message in the messages array
        const messageIndex = messages.findIndex(
          (m) => m.id === currentAssistantMessage.id
        );
        if (messageIndex !== -1) {
          messages[messageIndex] = { ...currentAssistantMessage };
        }

        // Save final state
        await ChatThread.findOneAndUpdate(
          { threadId, userId, isActive: true },
          { $set: { messages } },
          { new: true }
        );
      },
    });

    // Add the assistant message to messages array
    messages.push(currentAssistantMessage);

    // Handle streaming events
    for await (const event of result.fullStream) {
      switch (event.type) {
        case "text-delta":
          res.write(`0:${JSON.stringify(event.textDelta)}\n`);
          break;
        case "tool-call":
          res.write(
            `9:${JSON.stringify({
              toolCallId: event.toolCallId,
              toolName: event.toolName,
              args: event.args,
            })}\n`
          );
          break;
        case "tool-result":
          res.write(
            `a:${JSON.stringify({
              toolCallId: event.toolCallId,
              result: event.result,
            })}\n`
          );
          break;
        case "error":
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

    // Send completion events
    res.write(
      `e:${JSON.stringify({ finishReason, usage, isContinued: false })}\n`
    );
    res.write(`d:${JSON.stringify({ finishReason, usage })}\n`);
  } catch (error) {
    console.error("Error in chat:", error);
    throw new DatabaseError("Failed to process message", error);
  } finally {
    res.end();
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
