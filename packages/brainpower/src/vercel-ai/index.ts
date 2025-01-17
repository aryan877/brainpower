import { tool, type CoreTool } from "ai";
import { BrainPowerAgent } from "../agent";
import { executeAction } from "../utils/actionExecutor";
import { ACTIONS } from "../actions";

export function createSolanaTools(
  BrainPowerAgent: BrainPowerAgent,
): Record<string, CoreTool> {
  const tools: Record<string, CoreTool> = {};
  const actionKeys = Object.keys(ACTIONS);

  for (const key of actionKeys) {
    const action = ACTIONS[key as keyof typeof ACTIONS];
    const toolConfig: any = {
      id: action.name,
      description: action.description,
      parameters: action.schema,
    };

    // Only add execute function for backend tools (ones with handlers)
    if (action.handler) {
      toolConfig.execute = async (params: any) => {
        const result = await executeAction(action, BrainPowerAgent, params);
        return result;
      };
    }

    tools[key] = tool(toolConfig);
  }

  return tools;
}
