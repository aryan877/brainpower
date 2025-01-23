import { PumpfunLaunchResponse } from "@repo/brainpower-agent";

export interface BaseToolResult<T> {
  status: "success" | "error";
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Define specific tool result types
export type PumpFunLaunchToolResult = BaseToolResult<PumpfunLaunchResponse>;

// Registry mapping tool names to their result types
export type ToolResultTypes = {
  LAUNCH_PUMPFUN_TOKEN_ACTION: PumpFunLaunchToolResult;
  // Add other tool result types here as needed
};

// Helper type to get the result type for a specific tool
export type ToolResultType<T extends keyof ToolResultTypes> =
  ToolResultTypes[T];
