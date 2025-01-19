import { BrainPowerAgent } from "brainpower-agent";
import { privyClient } from "../lib/privyClient.js";
import { SOLANA_CAIP2 } from "../middleware/auth/cluster.js";
import { config } from "dotenv";

config();

const {
  OPENAI_API_KEY,
  PRIVY_APP_ID,
  PRIVY_APP_SECRET,
  SOLANA_MAINNET_RPC_URL,
  SOLANA_DEVNET_RPC_URL,
} = process.env;

if (
  !OPENAI_API_KEY ||
  !PRIVY_APP_ID ||
  !PRIVY_APP_SECRET ||
  !SOLANA_MAINNET_RPC_URL ||
  !SOLANA_DEVNET_RPC_URL
) {
  throw new Error("Missing required environment variables");
}

interface GenerateBrainpowerAgentParams {
  walletId: string;
  cluster: "mainnet-beta" | "devnet";
}

export function generateBrainpowerAgent({
  walletId,
  cluster,
}: GenerateBrainpowerAgentParams): BrainPowerAgent {
  const rpcUrl =
    cluster === "mainnet-beta" ? SOLANA_MAINNET_RPC_URL : SOLANA_DEVNET_RPC_URL;
  const caip2 =
    cluster === "mainnet-beta" ? SOLANA_CAIP2.MAINNET : SOLANA_CAIP2.DEVNET;

  return new BrainPowerAgent(
    rpcUrl,
    { OPENAI_API_KEY },
    privyClient,
    walletId,
    caip2,
    PRIVY_APP_ID,
    PRIVY_APP_SECRET
  );
}
