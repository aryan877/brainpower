import { ToolConfig } from "../types/index.js";
import { createSolanaAgent } from "../agent/createAgent.js";

interface RegisterDomainArgs {
  domain: string;
  spaceKB?: number;
}

export const registerDomainTool: ToolConfig<RegisterDomainArgs> = {
  definition: {
    type: "function",
    function: {
      name: "register_domain",
      description: "Register a .sol domain name using Bonfida Name Service",
      parameters: {
        type: "object",
        properties: {
          domain: {
            type: "string",
            description: "Domain name to register (without .sol)",
          },
          spaceKB: {
            type: "number",
            description: "Space allocation in KB (default: 1)",
          },
        },
        required: ["domain"],
      },
    },
  },
  handler: async ({ domain, spaceKB = 1 }) => {
    console.log("🌐 Starting registerDomain handler");
    console.log(`📝 Domain: ${domain}.sol`);

    try {
      const agent = createSolanaAgent();
      console.log("🔄 Registering domain");

      const signature = await agent.registerDomain(domain, spaceKB);

      console.log("✅ Domain registration successful");
      return {
        success: true,
        signature,
        domain: `${domain}.sol`,
        space_kb: spaceKB,
      };
    } catch (error) {
      console.error("❌ Error in registerDomain:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
