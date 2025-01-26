import { PumpfunLaunchResponse } from "@repo/brainpower-agent";

export type ToolResultStatus = "success" | "error" | "cancelled";

// Base result interface with generic type parameter
export interface ToolResultBase<T = unknown> {
  status: ToolResultStatus;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Define specific tool result types
export type PumpFunLaunchToolResult = ToolResultBase<PumpfunLaunchResponse>;

// Registry mapping tool names to their result types
export interface ToolResultTypes {
  LAUNCH_PUMPFUN_TOKEN_ACTION: PumpFunLaunchToolResult;
  // Add other tool result types here as needed
}

// Helper type to get the result type for a specific tool
export type ToolResultType<T extends keyof ToolResultTypes> =
  ToolResultTypes[T];

// Type guard for checking if a result matches the ToolResultBase structure
export function isToolResult(value: unknown): value is ToolResultBase {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "message" in value &&
    (value as ToolResultBase).status in
      {
        success: true,
        error: true,
        cancelled: true,
      }
  );
}
