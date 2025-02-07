import { z } from "zod";
import { validateRequest } from "./validateRequest.js";

// Schema for getting paged agents
export const validateGetPagedAgents = validateRequest({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1))
      .refine((val) => val > 0, { message: "Page must be greater than 0" }),
    pageSize: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10))
      .refine((val) => val >= 1 && val <= 25, {
        message: "Page size must be between 1 and 25",
      }),
    interval: z.enum(["_3Days", "_7Days"]).optional().default("_7Days"),
  }),
});
