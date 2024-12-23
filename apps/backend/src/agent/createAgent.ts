import { SolanaAgentKit } from "solana-agent-kit";
import { config } from "dotenv";

config();

export function createSolanaAgent(): SolanaAgentKit {
  if (!process.env.PRIVATE_KEY_BASE58) {
    throw new Error("⛔ Missing PRIVATE_KEY_BASE58 in .env");
  }

  const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

  const openAiKey = process.env.OPENAI_API_KEY || "";

  return new SolanaAgentKit(process.env.PRIVATE_KEY_BASE58, rpcUrl, openAiKey);
}
