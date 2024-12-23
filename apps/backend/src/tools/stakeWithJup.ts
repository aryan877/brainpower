import { ToolConfig } from "../types/index.js";
import { createSolanaAgent } from "../agent/createAgent.js";
import { VersionedTransaction } from "@solana/web3.js";

interface StakeWithJupArgs {
  amount: number;
}

export const stakeWithJupTool: ToolConfig<StakeWithJupArgs> = {
  definition: {
    type: "function",
    function: {
      name: "stake_with_jup",
      description: "Stake SOL with Jupiter validator to receive jupSOL",
      parameters: {
        type: "object",
        properties: {
          amount: {
            type: "number",
            description: "Amount of SOL to stake",
          },
        },
        required: ["amount"],
      },
    },
  },
  handler: async ({ amount }) => {
    console.log("🚀 Starting stakeWithJup handler");
    console.log(`📝 Amount to stake: ${amount} SOL`);

    try {
      const agent = createSolanaAgent();

      console.log("🔄 Creating staking transaction");
      const response = await fetch(
        `https://worker.jup.ag/blinks/swap/So11111111111111111111111111111111111111112/jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v/${amount}`,
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
          `Failed to create staking transaction: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("🔄 Processing transaction");

      const txn = VersionedTransaction.deserialize(
        Buffer.from(data.transaction, "base64")
      );

      const { blockhash } = await agent.connection.getLatestBlockhash();
      txn.message.recentBlockhash = blockhash;

      console.log("🔄 Signing and sending transaction");
      txn.sign([agent.wallet]);
      const signature = await agent.connection.sendTransaction(txn, {
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

      console.log("✅ Staking successful");
      return {
        success: true,
        signature,
        amount_staked: amount,
        token: "jupSOL",
      };
    } catch (error) {
      console.error("❌ Error in stakeWithJup:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
