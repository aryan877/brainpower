import { z } from "zod";
import { validateRequest } from "./validateRequest.js";

// Schema for storing a wallet
export const validateStoreWallet = validateRequest({
  body: z.object({
    address: z
      .string()
      .min(1, "Wallet address is required")
      .max(256, "Wallet address is too long"),
    chainType: z
      .string()
      .min(1, "Chain type is required")
      .default("solana")
      .refine((val) => ["solana"].includes(val), {
        message: "Unsupported chain type",
      }),
  }),
});

// Schema for sending a transaction
export const validateSendTransaction = validateRequest({
  body: z.object({
    serializedTransaction: z
      .string()
      .min(1, "Serialized transaction is required")
      .refine((val) => {
        try {
          Buffer.from(val, "base64");
          return true;
        } catch {
          return false;
        }
      }, "Invalid base64 encoded transaction"),
    options: z
      .object({
        commitment: z
          .enum(["processed", "confirmed", "finalized"])
          .default("confirmed"),
        skipPreflight: z.boolean().default(false),
        maxRetries: z.number().int().min(0).max(10).default(3),
      })
      .optional(),
  }),
});

// Schema for simulating transaction fee
export const validateSimulateFee = validateRequest({
  body: z.object({
    serializedTransaction: z
      .string()
      .min(1, "Serialized transaction is required")
      .refine((val) => {
        try {
          Buffer.from(val, "base64");
          return true;
        } catch {
          return false;
        }
      }, "Invalid base64 encoded transaction"),
  }),
});

// Schema for getting transaction history
export const validateTransactionHistory = validateRequest({
  query: z.object({
    address: z
      .string()
      .min(1, "Wallet address is required")
      .max(256, "Wallet address is too long"),
    before: z.string().optional(),
    limit: z.number().int().min(1).max(5).default(5),
  }),
});
