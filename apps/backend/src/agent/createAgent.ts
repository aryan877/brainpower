import { SolanaAgentKit } from "solana-agent-kit";
import { config } from "dotenv";

config();

export function createSolanaAgent(): SolanaAgentKit {
  if (!process.env.PRIVATE_KEY_BASE58) {
    throw new Error("⛔ Missing PRIVATE_KEY_BASE58 in .env");
  }
  if (!process.env.HELIUS_API_KEY) {
    throw new Error("⛔ Missing HELIUS_API_KEY in .env");
  }

  const heliusRpcUrl = `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

  const openAiKey = process.env.OPENAI_API_KEY || "";

  return new SolanaAgentKit(
    process.env.PRIVATE_KEY_BASE58,
    heliusRpcUrl,
    openAiKey
  );
}
