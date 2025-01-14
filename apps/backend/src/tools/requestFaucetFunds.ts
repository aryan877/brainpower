import { ToolConfig } from "src/types";
import { createSolanaAgent } from "../agent/createAgent.js";

interface RequestFaucetFundsArgs {
  amountSol?: number;
}

export const requestFaucetFundsTool: ToolConfig<RequestFaucetFundsArgs> = {
  definition: {
    type: "function",
    function: {
      name: "request_faucet_funds",
      description: "Request test SOL from the faucet (devnet/testnet only).",
      parameters: {
        type: "object",
        properties: {
          amountSol: {
            type: "number",
            description: "How many devnet SOL to airdrop? (optional)",
          },
        },
        required: [],
      },
    },
  },
  handler: async ({ amountSol }) => {
    console.log("🔍 Starting requestFaucetFunds handler");
    console.log(
      `📝 Amount SOL parameter: ${amountSol || "Not provided (default 5 SOL)"}`
    );

    try {
      console.log("🔄 Creating Solana agent");
      const agent = createSolanaAgent();

      if (!agent.connection.rpcEndpoint.includes("devnet")) {
        throw new Error("Faucet is only for devnet/testnet usage!");
      }

      if (!amountSol) {
        console.log("💧 Requesting default faucet funds (5 SOL)");
        const sig = await agent.requestFaucetFunds();
        console.log(
          `✅ Faucet funds requested: 5 SOL, Transaction Signature: ${sig}`
        );
        const result = { transactionSignature: sig, minted: 5 };
        console.log("📤 Returning result:", result);
        return result;
      }

      console.log(`💧 Requesting custom faucet funds: ${amountSol} SOL`);
      const lamports = amountSol * 1_000_000_000;
      const sig = await agent.connection.requestAirdrop(
        agent.wallet_address,
        lamports
      );
      console.log(
        `✅ Custom faucet funds requested: ${amountSol} SOL, Transaction Signature: ${sig}`
      );
      const result = { transactionSignature: sig, minted: amountSol };
      console.log("📤 Returning result:", result);
      return result;
    } catch (error) {
      console.error("❌ Error in requestFaucetFunds:", error);
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
