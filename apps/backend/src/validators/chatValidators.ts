import { z } from "zod";
import { validateRequest } from "./validateRequest.js";

// Schema for sending a message
export const validateSendMessage = validateRequest({
  body: z.object({
    message: z
      .string()
      .min(1, "Message cannot be empty")
      .max(4000, "Message is too long"),
    threadId: z.string(),
  }),
});

// Schema for getting thread history
export const validateThreadHistory = validateRequest({
  params: z.object({
    threadId: z.string(),
  }),
});

// Schema for deleting a thread
export const validateDeleteThread = validateRequest({
  params: z.object({
    threadId: z.string(),
  }),
});
