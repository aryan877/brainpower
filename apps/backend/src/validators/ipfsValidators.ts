import { z } from "zod";

// Base schema for file uploads
export const fileUploadSchema = z.object({
  file: z.any(),
});

// Schema for pump.fun metadata
export const pumpFunUploadSchema = fileUploadSchema.extend({
  name: z
    .string()
    .min(1, "Token name is required")
    .max(50, "Token name too long"),
  symbol: z
    .string()
    .min(1, "Token symbol is required")
    .max(10, "Token symbol too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description too long"),
  showName: z.string().optional(),
  twitter: z.string().max(100, "Twitter handle too long").optional(),
  telegram: z.string().max(100, "Telegram link too long").optional(),
  website: z
    .string()
    .url("Invalid website URL")
    .max(200, "Website URL too long")
    .optional(),
});

export type PumpFunUploadRequest = z.infer<typeof pumpFunUploadSchema>;
