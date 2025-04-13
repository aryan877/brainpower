import { BrainPowerAgent, Cluster } from "@repo/brainpower-agent";
import { privyClient } from "../lib/privyClient.js";
import { SOLANA_CAIP2 } from "../middleware/auth/cluster.js";
import { config } from "dotenv";

config();

const {
  OPENAI_API_KEY,
  PRIVY_DEV_APP_ID,
  PRIVY_PROD_APP_ID,
  PRIVY_DEV_APP_SECRET,
  PRIVY_PROD_APP_SECRET,
  SOLANA_MAINNET_RPC_URL,
  SOLANA_DEVNET_RPC_URL,
} = process.env;

const PRIVY_APP_ID =
  process.env.NODE_ENV === "production" ? PRIVY_PROD_APP_ID : PRIVY_DEV_APP_ID;

const PRIVY_APP_SECRET =
  process.env.NODE_ENV === "production"
    ? PRIVY_PROD_APP_SECRET
    : PRIVY_DEV_APP_SECRET;

if (
  !OPENAI_API_KEY ||
  !PRIVY_APP_ID ||
  !PRIVY_APP_SECRET ||
  !SOLANA_MAINNET_RPC_URL ||
  !SOLANA_DEVNET_RPC_URL
) {
  throw new Error(
    `Missing required environment variables: ${[
      !OPENAI_API_KEY && "OPENAI_API_KEY",
      !PRIVY_APP_ID && "PRIVY_APP_ID",
      !PRIVY_APP_SECRET && "PRIVY_APP_SECRET",
      !SOLANA_MAINNET_RPC_URL && "SOLANA_MAINNET_RPC_URL",
      !SOLANA_DEVNET_RPC_URL && "SOLANA_DEVNET_RPC_URL",
    ]
      .filter(Boolean)
      .join(", ")}`
  );
}

interface GenerateBrainpowerAgentParams {
  address: string;
  cluster: Cluster;
}

export function generateBrainpowerAgent({
  address,
  cluster,
}: GenerateBrainpowerAgentParams): BrainPowerAgent {
  const rpcUrl =
    cluster === "mainnet-beta" ? SOLANA_MAINNET_RPC_URL : SOLANA_DEVNET_RPC_URL;
  const caip2 =
    cluster === "mainnet-beta" ? SOLANA_CAIP2.MAINNET : SOLANA_CAIP2.DEVNET;

  if (!rpcUrl) {
    throw new Error("RPC URL is undefined");
  }

  if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
    throw new Error("Privy credentials are undefined");
  }

  return new BrainPowerAgent(
    rpcUrl,
    { OPENAI_API_KEY, PRIORITY_LEVEL: "high" },
    privyClient,
    address,
    caip2,
    PRIVY_APP_ID,
    PRIVY_APP_SECRET
  );
}
