import { createAzure } from "@ai-sdk/azure";
import { createSolanaTools } from "@repo/brainpower-agent";
import { smoothStream, streamText } from "ai";
import { Response } from "express";
import { nanoid } from "nanoid";
import { assistantPrompt } from "../const/prompt.js";
import { AuthenticatedRequest } from "../middleware/auth/index.js";
import {
  APIError,
  ErrorCode,
  NotFoundError,
} from "../middleware/errors/types.js";
import { ChatThread } from "../models/ChatThread.js";
import { generateBrainpowerAgent } from "../utils/generateBrainpowerAgent.js";
import { getUserCluster, getUserId } from "../utils/userIdentification.js";

const azure = createAzure({
  resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
});

export const getThreads = async (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const limit = parseInt(req.query.limit as string) || 10;
  const cursor = req.query.cursor as string | undefined;

  const query: any = { userId, isActive: true };
  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const threads = await ChatThread.find(query, {
    threadId: 1,
    createdAt: 1,
    updatedAt: 1,
    title: 1,
  })
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasMore = threads.length > limit;
  const items = hasMore ? threads.slice(0, -1) : threads;
  const nextCursor =
    hasMore && threads[limit]
      ? threads[limit].createdAt.toISOString()
      : undefined;

  return {
    threads: items,
    nextCursor,
    hasMore,
  };
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

  return {
    threadId: chatThread.threadId,
    createdAt: chatThread.createdAt,
    updatedAt: chatThread.updatedAt,
    title: chatThread.title || undefined,
    messages: [],
  };
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  // Create an AbortController that will be triggered when the request is aborted
  const controller = new AbortController();
  const { signal } = controller;
  const requestId = nanoid(8); // Unique ID for logging this request

  const userId = getUserId(req);
  const cluster = getUserCluster(req);
  const { messages, threadId } = req.body;

  console.info(
    `[${requestId}] sendMessage: Started for userId=${userId}, threadId=${threadId}, cluster=${cluster}`
  );

  // Add abort handler to clean up when the request is closed
  req.on("close", () => {
    console.warn(
      `[${requestId}] sendMessage: Client closed connection for userId=${userId}, threadId=${threadId}. Aborting.`
    );
    if (!signal.aborted) {
      controller.abort();
    }
  });

  // Optional: Log message count or first message for context, avoid logging full content if sensitive
  // console.debug(`[${requestId}] sendMessage: Received ${messages?.length} messages. First message role: ${messages?.[0]?.role}`);

  try {
    console.info(
      `[${requestId}] sendMessage: Finding chat thread for userId=${userId}, threadId=${threadId}`
    );
    const chatThread = await ChatThread.findOne({
      threadId,
      userId,
      isActive: true,
    });

    if (!chatThread) {
      console.warn(
        `[${requestId}] sendMessage: Chat thread not found for userId=${userId}, threadId=${threadId}`
      );
      throw new NotFoundError("Thread not found");
    }
    console.info(
      `[${requestId}] sendMessage: Chat thread found for userId=${userId}, threadId=${threadId}`
    );

    // Update title if first user message and no title exists
    if (!chatThread.title && messages?.length > 0) {
      const firstUserMessage = messages.find(
        (msg: { role: string; content: string }) => msg.role === "user"
      );
      if (firstUserMessage) {
        const newTitle = firstUserMessage.content.slice(0, 100);
        console.info(
          `[${requestId}] sendMessage: Updating thread title for userId=${userId}, threadId=${threadId} to "${newTitle}"`
        );
        chatThread.title = newTitle;
        // Use try-catch for save operation if needed for finer error handling
        await chatThread.save();
        console.info(
          `[${requestId}] sendMessage: Thread title updated successfully for userId=${userId}, threadId=${threadId}`
        );
      }
    }

    const walletAddress = req.user?.walletAddress || "";
    console.info(
      `[${requestId}] sendMessage: Generating Brainpower agent for address=${walletAddress}, cluster=${cluster}`
    );
    const agent = generateBrainpowerAgent({
      address: walletAddress,
      cluster: cluster,
    });

    console.info(`[${requestId}] sendMessage: Creating Solana tools`);
    const tools = createSolanaTools(agent);

    console.info(
      `[${requestId}] sendMessage: Calling streamText API for userId=${userId}, threadId=${threadId}`
    );
    const result = streamText({
      model: azure("gpt-4o"),
      messages,
      experimental_toolCallStreaming: true,
      maxSteps: 5,
      system: assistantPrompt,
      tools,
      experimental_transform: smoothStream(),
      abortSignal: signal,
      // Optional: Add more detailed callbacks for debugging streamText lifecycle
      // onStart: () => console.info(`[${requestId}] streamText: Stream started`),
      // onFinish: (result) => console.info(`[${requestId}] streamText: Stream finished. Result:`, result.finishReason),
      // onError: (error) => console.error(`[${requestId}] streamText: Error during stream:`, error),
    });

    console.info(
      `[${requestId}] sendMessage: Converting result to data stream response for userId=${userId}, threadId=${threadId}`
    );
    const streamResponse = result.toDataStreamResponse();
    const stream = streamResponse.body;

    if (!stream) {
      console.error(
        `[${requestId}] sendMessage: Failed to get stream body for userId=${userId}, threadId=${threadId}`
      );
      throw new APIError(
        500,
        ErrorCode.INTERNAL_SERVER_ERROR,
        "No stream available"
      );
    }
    console.info(
      `[${requestId}] sendMessage: Stream body obtained, getting reader for userId=${userId}, threadId=${threadId}`
    );

    const reader = stream.getReader();
    console.info(
      `[${requestId}] sendMessage: Starting stream read loop for userId=${userId}, threadId=${threadId}`
    );
    try {
      while (true) {
        // Check for abort *before* reading to potentially avoid unnecessary work
        if (signal.aborted) {
          console.warn(
            `[${requestId}] sendMessage: Abort signal detected before read for userId=${userId}, threadId=${threadId}.`
          );
          // Attempt to release lock gracefully, ignore error if already released
          try {
            await reader.cancel();
            reader.releaseLock();
          } catch {}
          if (!res.writableEnded) {
            res.end();
          }
          return;
        }

        const { done, value } = await reader.read();

        if (done) {
          console.info(
            `[${requestId}] sendMessage: Stream finished successfully for userId=${userId}, threadId=${threadId}`
          );
          if (!res.writableEnded) {
            res.end();
          }
          break;
        }

        // Check for abort *after* reading (in case it happened during the read)
        if (signal.aborted) {
          console.warn(
            `[${requestId}] sendMessage: Abort signal detected after read for userId=${userId}, threadId=${threadId}.`
          );
          // Attempt to release lock gracefully, ignore error if already released
          try {
            reader.releaseLock();
          } catch {}
          if (!res.writableEnded) {
            res.end();
          }
          return;
        }

        // console.debug(`[${requestId}] sendMessage: Writing chunk for userId=${userId}, threadId=${threadId}`); // Very verbose
        if (!res.writableEnded) {
          res.write(value);
        } else {
          console.warn(
            `[${requestId}] sendMessage: Attempted to write to ended response stream for userId=${userId}, threadId=${threadId}. Aborting source stream.`
          );
          if (!signal.aborted) controller.abort(); // Abort the source stream
          // Attempt to release lock gracefully, ignore error if already released
          try {
            reader.releaseLock();
          } catch {}
          break; // Exit loop
        }
      }
    } catch (error) {
      console.error(
        `[${requestId}] sendMessage: Error during stream read loop for userId=${userId}, threadId=${threadId}:`,
        error
      );
      // Attempt to release lock gracefully, ignore error if already released
      try {
        reader.releaseLock();
      } catch {}
      if (!res.headersSent && !res.writableEnded) {
        console.error(
          `[${requestId}] sendMessage: Throwing APIError due to stream processing failure.`
        );
        throw new APIError(
          500,
          ErrorCode.INTERNAL_SERVER_ERROR,
          "Stream processing failed",
          error instanceof Error ? error.message : String(error)
        );
      } else if (!res.writableEnded) {
        console.warn(
          `[${requestId}] sendMessage: Headers already sent or stream ended, cannot throw error. Ending response.`
        );
        res.end();
      }
    } finally {
      // Final check to ensure the reader lock is released if the loop exits unexpectedly
      // Although handled in done/abort/catch, this is a safeguard.
      try {
        reader.releaseLock();
        // console.debug(`[${requestId}] sendMessage: Stream reader lock released in read loop finally block.`);
      } catch (e) {
        // Ignore error if lock was already released or reader is invalid
      }
    }
  } catch (error) {
    console.error(
      `[${requestId}] sendMessage: Error in main handler for userId=${userId}, threadId=${threadId}:`,
      error
    );
    if (!res.headersSent && !res.writableEnded) {
      // If it's already an APIError, rethrow it after logging
      if (error instanceof APIError) {
        console.error(
          `[${requestId}] sendMessage: APIError caught: ${error.message}`,
          error
        );
        throw error; // Rethrow the original APIError to be handled by error middleware
      }

      // For other errors, wrap them in APIError
      console.error(
        `[${requestId}] sendMessage: Non-APIError caught, wrapping in APIError:`,
        error
      );
      throw new APIError(
        500,
        ErrorCode.INTERNAL_SERVER_ERROR,
        error instanceof Error ? error.message : "An unexpected error occurred",
        error instanceof Error ? error.stack : undefined
      );
    } else {
      console.warn(
        `[${requestId}] sendMessage: Error occurred but headers already sent or response ended for userId=${userId}, threadId=${threadId}. Cannot send error response. Error:`,
        error
      );
      // Ensure the connection is closed if possible
      if (!res.writableEnded) {
        res.end();
      }
    }
  } finally {
    // Clean up the AbortController if it wasn't already aborted (e.g., by client closing connection)
    if (!signal.aborted) {
      console.info(
        `[${requestId}] sendMessage: Aborting controller in finally block for userId=${userId}, threadId=${threadId}`
      );
      controller.abort();
    } else {
      console.info(
        `[${requestId}] sendMessage: Controller already aborted, skipping abort in finally block for userId=${userId}, threadId=${threadId}`
      );
    }
    console.info(
      `[${requestId}] sendMessage: Finished processing for userId=${userId}, threadId=${threadId}`
    );
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

  return {
    threadId: chatThread.threadId,
    messages: chatThread.messages,
    createdAt: chatThread.createdAt,
    updatedAt: chatThread.updatedAt,
  };
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

  return { message: "Thread deleted successfully" };
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

  return {
    success: true,
    threadId,
    messageCount: messages.length,
  };
};
