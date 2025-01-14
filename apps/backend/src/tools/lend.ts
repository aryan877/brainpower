import { ToolConfig } from "../types/index.js";
import { createSolanaAgent } from "../agent/createAgent.js";
import { VersionedTransaction } from "@solana/web3.js";

interface LendArgs {
  amount: number;
}

export const lendTool: ToolConfig<LendArgs> = {
  definition: {
    type: "function",
    function: {
      name: "lend_asset",
      description: "Lend USDC tokens for yields using Lulo",
      parameters: {
        type: "object",
        properties: {
          amount: {
            type: "number",
            description: "Amount of USDC to lend",
          },
        },
        required: ["amount"],
      },
    },
  },
  handler: async ({ amount }) => {
    console.log("💰 Starting lend handler");
    console.log(`📝 Amount to lend: ${amount} USDC`);

    try {
      const agent = createSolanaAgent();

      console.log("🔄 Creating lending transaction");
      const response = await fetch(
        `https://blink.lulo.fi/actions?amount=${amount}&symbol=USDC`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            account: agent.wallet.publicKey.toBase58(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to create lending transaction: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("🔄 Processing transaction");

      const luloTxn = VersionedTransaction.deserialize(
        Buffer.from(data.transaction, "base64")
      );

      const { blockhash } = await agent.connection.getLatestBlockhash();
      luloTxn.message.recentBlockhash = blockhash;

      console.log("🔄 Signing transaction");
      luloTxn.sign([agent.wallet]);

      console.log("🔄 Sending transaction");
      const signature = await agent.connection.sendTransaction(luloTxn, {
        preflightCommitment: "confirmed",
        maxRetries: 3,
      });

      console.log("🔄 Confirming transaction");
      const latestBlockhash = await agent.connection.getLatestBlockhash();
      await agent.connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      console.log("✅ Lending successful");
      return {
        success: true,
        signature,
        amount,
        token: "USDC",
      };
    } catch (error) {
      console.error("❌ Error in lend:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
