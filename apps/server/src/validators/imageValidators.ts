import { z } from "zod";
import { validateRequest } from "./validateRequest.js";

const imageGenerationSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt is required")
    .max(1000, "Prompt is too long"),
});

export const validateImageGeneration = validateRequest({
  body: imageGenerationSchema,
});

export type ImageGenerationRequest = z.infer<typeof imageGenerationSchema>;
