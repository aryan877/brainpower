import { SolanaAgentKit } from "solana-agent-kit";
import * as dotenv from "dotenv";

dotenv.config();

export function createSolanaAgent(): SolanaAgentKit {
  if (!process.env.SOLANA_PRIVATE_KEY) {
    throw new Error("⛔ Missing SOLANA_PRIVATE_KEY in .env");
  }

  const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

  // supply your openAI key
  const openAiKey = process.env.OPENAI_API_KEY || "";

  return new SolanaAgentKit(process.env.SOLANA_PRIVATE_KEY, rpcUrl, openAiKey);
}
