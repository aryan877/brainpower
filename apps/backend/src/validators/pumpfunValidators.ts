import { z } from "zod";
import { validateRequest } from "./validateRequest.js";

// Schema for getting bundle analysis
export const validateGetBundleAnalysis = validateRequest({
  query: z.object({
    mintAddress: z.string().min(32, "Invalid mint address"),
  }),
});
