import { VersionedTransaction } from "@solana/web3.js";
import axios from "axios";
import { BrainPowerAgent } from "src/agent/index.js";
import { DEBRIDGE_API } from "../../constants/index.js";
import { deBridgeOrderInput } from "../../types/index.js";

const REFERRAL_CODE = "21064";

// Chain ID to RPC mapping
const CHAIN_RPC_MAP: Record<string, string[]> = {
  "1": [
    "https://eth-mainnet.public.blastapi.io",
    "https://eth.llamarpc.com",
    "https://rpc.ankr.com/eth",
  ], // Ethereum
  "10": [
    "https://optimism-mainnet.public.blastapi.io",
    "https://rpc.ankr.com/optimism",
  ], // Optimism
  "56": ["https://bsc-mainnet.public.blastapi.io", "https://rpc.ankr.com/bsc"], // BSC
  "137": [
    "https://rpc.ankr.com/polygon",
    "https://polygon-mainnet.public.blastapi.io",
    "https://polygon.llamarpc.com",
  ], // Polygon
  "250": ["https://fantom-mainnet.public.blastapi.io"], // Fantom
  "8453": ["https://mainnet.base.org", "https://rpc.ankr.com/base"], // Base
  "42161": [
    "https://arb1.arbitrum.io/rpc",
    "https://arbitrum.llamarpc.com",
    "https://rpc.ankr.com/arbitrum",
  ], // Arbitrum
  "43114": [
    "https://api.avax.network/ext/bc/C/rpc",
    "https://rpc.ankr.com/avalanche",
  ], // Avalanche
  "59144": [
    "https://rpc.linea.build",
    "https://linea-rpc.publicnode.com",
    "https://1rpc.io/linea",
  ], // Linea
  "7565164": [
    "https://solana-rpc.debridge.finance",
    "https://solana-rpc2.debridge.finance",
  ], // Solana
  "100000001": [
    "https://neon-proxy-mainnet.solana.p2p.org",
    "https://neon-rpc.debridge.finance",
  ], // Neon
  "100000002": [
    "https://rpc.eu-central-2.gateway.fm/v4/gnosis/non-archival/mainnet",
  ], // Gnosis
  "100000004": [
    "https://andromeda.metis.io/?owner=1088",
    "https://metis-mainnet.public.blastapi.io",
  ], // Metis
  "100000005": ["https://connect.bit-rock.io"], // Bitrock
  "100000006": ["https://rpc.mainnet.ms"], // CrossFi
  "100000010": ["https://mainnet.zkevm.cronos.org"], // zkEvmCronos
  "100000013": ["https://Homer.storyrpc.io"], // Story
  "100000014": ["https://rpc.soniclabs.com"], // Sonic
  "100000015": ["https://zircuit-mainnet.drpc.org"], // Zirciut
  "100000017": ["https://abstract-rpc.debridge.finance"], // Abstract
  "100000020": ["https://rpc.berachain.com/"], // Berachain
  "100000022": ["https://rpc.hyperliquid.xyz/evm"], // HyperEVM
};

/**
 * Get RPC URL for a given chain ID
 * @param chainId The chain ID to get RPC URL for
 * @returns The RPC URL for the chain
 * @throws Error if no RPC URL is found for the chain
 */
function getRpcUrlForChain(chainId: string | number): string {
  const chainIdStr = chainId.toString();
  const rpcUrls = CHAIN_RPC_MAP[chainIdStr];
  if (!rpcUrls || rpcUrls.length === 0) {
    throw new Error(`No RPC URL found for chain ID ${chainIdStr}`);
  }
  // Return the first RPC URL from the list
  return rpcUrls[0] as string;
}

/**
 * Type guard to check if a value is a non-empty string
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * Process and execute a bridge transfer for cross-chain token movement
 * Currently only supports bridging FROM Solana TO other chains
 *
 * @param agent BrainPowerAgent instance
 * @param params Bridge transfer parameters
 * @param params.srcChainId Source chain ID (must be '7565164' for Solana)
 * @param params.srcChainTokenIn Token address on source chain (use "11111111111111111111111111111111" for Solana's native SOL)
 * @param params.srcChainTokenInAmount Amount to bridge (in token's smallest unit - e.g., 1.0 SOL = 1000000000 lamports)
 * @param params.dstChainId Destination chain ID
 * @param params.dstChainTokenOut Token address on destination chain
 * @param params.dstChainTokenOutRecipient Recipient address on destination chain
 * @param params.account Sender's wallet address
 * @returns Transaction hash of the executed bridge transfer
 */
export async function processTransfer(
  agent: BrainPowerAgent,
  params: deBridgeOrderInput,
): Promise<string> {
  // Validate required parameters
  if (!isNonEmptyString(params.srcChainId)) {
    throw new Error(
      "Source chain ID is required and must be a non-empty string",
    );
  }

  if (params.srcChainId !== "7565164") {
    throw new Error(
      "This implementation only supports bridging FROM Solana (chain ID: 7565164)",
    );
  }

  if (!isNonEmptyString(params.dstChainId)) {
    throw new Error(
      "Destination chain ID is required and must be a non-empty string",
    );
  }

  if (!isNonEmptyString(params.dstChainTokenOutRecipient)) {
    throw new Error(
      "Destination chain token recipient is required and must be a non-empty string",
    );
  }

  if (params.srcChainId === params.dstChainId) {
    throw new Error("Source and destination chains must be different");
  }

  // Get RPC URL for source chain
  const rpcUrl = getRpcUrlForChain(params.srcChainId!);

  // Always set dstChainTokenOutAmount to "auto" to get the best rate
  const dstChainTokenOutAmount = "auto";

  // Always set prependOperatingExpenses to "true" to include all fees
  const prependOperatingExpenses = "true";

  const queryParams = new URLSearchParams({
    srcChainId: params.srcChainId,
    srcChainTokenIn: params.srcChainTokenIn,
    srcChainTokenInAmount: params.srcChainTokenInAmount,
    dstChainId: params.dstChainId,
    dstChainTokenOut: params.dstChainTokenOut,
    dstChainTokenOutAmount: dstChainTokenOutAmount,
    dstChainTokenOutRecipient: params.dstChainTokenOutRecipient,
    senderAddress: params.account,
    srcChainOrderAuthorityAddress: params.account,
    srcChainRefundAddress: params.account,
    dstChainOrderAuthorityAddress: params.dstChainTokenOutRecipient,
    referralCode: params.referralCode?.toString() || REFERRAL_CODE,
    prependOperatingExpenses: prependOperatingExpenses,
  });

  try {
    const response = await axios.get(
      `${DEBRIDGE_API}/dln/order/create-tx?${queryParams}`,
    );

    const data = response.data;

    if (data.error) {
      throw new Error(`DeBridge API Error: ${data.error}`);
    }

    // Create a versioned transaction from the API response
    const transactionBuf = Buffer.from(data.tx.data.toString(), "hex");
    const transaction = VersionedTransaction.deserialize(transactionBuf);

    // Sign and send transaction
    const signature = await agent.signAndSendTransaction(transaction, {
      skipPreflight: false,
      maxRetries: 3,
      commitment: "confirmed",
    });

    return signature;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to execute bridge transfer: ${error.message}. ${error.response?.data}`,
      );
    }
    throw error;
  }
}
