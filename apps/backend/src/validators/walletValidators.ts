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
