import { PumpFunLaunchTool } from "./PumpFunLaunchTool";
import { ToolInvocation } from "ai";
import { ToolResultType, ToolResultTypes } from "../../types/tools";

interface ToolConfig<T extends keyof ToolResultTypes> {
  component: React.ComponentType<{
    args: Record<string, unknown>;
    onSubmit: (result: ToolResultType<T>) => void;
  }>;
  preprocess?: (result: unknown) => ToolResultType<T>;
}

type ToolRegistry = {
  [T in keyof ToolResultTypes]: ToolConfig<T>;
};

export const toolRegistry: ToolRegistry = {
  LAUNCH_PUMPFUN_TOKEN_ACTION: {
    component: PumpFunLaunchTool,
  },
};

export function getToolComponent(toolInvocation: ToolInvocation) {
  const { toolName } = toolInvocation;
  const config = toolRegistry[toolName as keyof ToolResultTypes];
  return config?.component;
}

export function preprocessToolResult<T extends keyof ToolResultTypes>(
  toolName: T,
  result: unknown
): ToolResultType<T> | unknown {
  const preprocessor = toolRegistry[toolName]?.preprocess;

  if (!preprocessor) {
    if (
      typeof result === "object" &&
      result !== null &&
      "status" in result &&
      "message" in result
    ) {
      return result;
    }
    return {
      status: "success",
      message: "Operation completed successfully",
      data: result,
    };
  }

  try {
    return preprocessor(result);
  } catch (error) {
    return {
      status: "error",
      message: "Failed to process tool result",
      error: {
        code: "PREPROCESS_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
    };
  }
}
