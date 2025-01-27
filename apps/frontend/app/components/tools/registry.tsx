import { PumpFunLaunchTool } from "./PumpFunLaunchTool";
import { ToolInvocation } from "ai";
import {
  ToolResultType,
  ToolResultTypes,
  isToolResult,
} from "../../types/tools";
import { ACTION_NAMES } from "@repo/brainpower-agent";

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
  [ACTION_NAMES.LAUNCH_PUMPFUN_TOKEN]: {
    component: PumpFunLaunchTool,
  },
};

export type ValidToolName = keyof typeof toolRegistry;
export const VALID_TOOL_NAMES = Object.keys(toolRegistry) as ValidToolName[];

export function getToolComponent(toolInvocation: ToolInvocation) {
  const { toolName } = toolInvocation;
  const config = toolRegistry[toolName as keyof ToolResultTypes];
  return config?.component;
}

export function preprocessToolResult<T extends keyof ToolResultTypes>(
  toolName: T,
  result: unknown
): ToolResultType<T> {
  const preprocessor = toolRegistry[toolName]?.preprocess;

  if (!preprocessor) {
    if (isToolResult(result)) {
      return result as ToolResultType<T>;
    }
    return {
      status: "success",
      message: "Operation completed successfully",
      data: result,
    } as ToolResultType<T>;
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
    } as ToolResultType<T>;
  }
}
