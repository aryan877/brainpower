import { ToolConfig } from "../types/index.js";
import { createSolanaAgent } from "../agent/createAgent.js";
import { PublicKey } from "@solana/web3.js";

interface GetBalanceArgs {
  tokenMint?: string; // optional: if not provided, use SOL
}

export const getBalanceTool: ToolConfig<GetBalanceArgs> = {
  definition: {
    type: "function",
    function: {
      name: "get_balance",
      description: "Get the balance of SOL or an SPL token for your wallet.",
      parameters: {
        type: "object",
        properties: {
          tokenMint: {
            type: "string",
            description:
              "Mint address of the SPL token. If omitted, gets SOL balance.",
          },
        },
        required: [],
      },
    },
  },
  handler: async ({ tokenMint }) => {
    console.log("🔍 Starting getBalance handler");
    console.log(
      `📝 Token mint parameter: ${tokenMint || "Not provided (using SOL)"}`
    );

    try {
      console.log("🔄 Creating Solana agent");
      const agent = createSolanaAgent();

      // If no tokenMint provided => native SOL
      if (!tokenMint) {
        console.log("💰 Fetching SOL balance");
        const solBalance = await agent.getBalance();
        console.log(`✅ SOL balance retrieved: ${solBalance}`);

        const result = {
          success: true,
          balance: solBalance,
          token: "SOL",
          formatted_balance: `${solBalance} SOL`,
          raw_balance: solBalance,
        };
        console.log("📤 Returning result:", result);
        return result;
      }

      // For SPL tokens
      console.log(`🪙 Fetching SPL token balance for mint: ${tokenMint}`);
      const balance = await agent.getBalance(new PublicKey(tokenMint));
      console.log(`✅ Token balance retrieved: ${balance}`);

      const result = {
        success: true,
        balance: balance,
        token: tokenMint,
        formatted_balance: `${balance} ${tokenMint}`,
        raw_balance: balance,
      };
      console.log("📤 Returning result:", result);
      return result;
    } catch (error) {
      console.error("❌ Error in getBalance:", error);
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        error_details: error instanceof Error ? error.stack : undefined,
      };
      console.log("📤 Returning error result:", errorResult);
      return errorResult;
    }
  },
};
