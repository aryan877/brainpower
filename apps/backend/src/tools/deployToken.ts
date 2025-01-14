import { ToolConfig } from "src/types";
import { createSolanaAgent } from "../agent/createAgent.js";

interface DeployTokenArgs {
  name: string;
  uri: string;
  symbol: string;
  decimals?: number;
  initialSupply?: number;
}

export const deployTokenTool: ToolConfig<DeployTokenArgs> = {
  definition: {
    type: "function",
    function: {
      name: "deploy_token",
      description: "Deploy a brand-new SPL token with optional initial supply",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          uri: { type: "string" },
          symbol: { type: "string" },
          decimals: { type: "number" },
          initialSupply: { type: "number" },
        },
        required: ["name", "uri", "symbol"],
      },
    },
  },
  handler: async ({ name, uri, symbol, decimals, initialSupply }) => {
    const agent = createSolanaAgent();
    const resp = await agent.deployToken(
      name,
      uri,
      symbol,
      decimals,
      initialSupply
    );
    return {
      mintAddress: resp.mint.toString(),
      decimals: decimals ?? 9,
      supply: initialSupply ?? 0,
    };
  },
};
