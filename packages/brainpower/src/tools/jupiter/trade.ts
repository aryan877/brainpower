import { VersionedTransaction, PublicKey } from "@solana/web3.js";
import { TOKENS, DEFAULT_OPTIONS } from "../../constants/index.js";
import { getMint } from "@solana/spl-token";
import { BrainPowerAgent } from "../../agent/index.js";
import { JupiterSwapResponse } from "../../types/index.js";
import { createJupiterApiClient } from "@jup-ag/api";
/**
 * Swap tokens using Jupiter Exchange
 * @param agent SolanaAgentKit instance
 * @param outputMint Target token mint address
 * @param inputAmount Amount to swap (in token decimals)
 * @param inputMint Source token mint address (defaults to USDC)
 * @param slippageBps Slippage tolerance in basis points (default: 300 = 3%)
 * @returns Transaction signature and swap details
 */
export async function trade(
  agent: BrainPowerAgent,
  outputMint: PublicKey,
  inputAmount: number,
  inputMint: PublicKey = TOKENS.USDC,
  slippageBps: number = DEFAULT_OPTIONS.SLIPPAGE_BPS,
): Promise<JupiterSwapResponse> {
  try {
    const jupiterQuoteApi = createJupiterApiClient();
    const isNativeSol = inputMint.equals(TOKENS.SOL);

    // For native SOL, we use LAMPORTS_PER_SOL, otherwise fetch mint info
    const inputDecimals = isNativeSol
      ? 9 // SOL always has 9 decimals
      : (await getMint(agent.connection, inputMint)).decimals;

    // Calculate the correct amount based on actual decimals
    const scaledAmount = inputAmount * Math.pow(10, inputDecimals);

    // Get quote using Jupiter API client
    const quoteResponse = await jupiterQuoteApi.quoteGet({
      inputMint: inputMint.toString(),
      outputMint: outputMint.toString(),
      amount: scaledAmount,
      slippageBps: slippageBps,
      onlyDirectRoutes: false,
      maxAccounts: 64,
    });

    // Get swap transaction using Jupiter API client
    const { swapTransaction } = await jupiterQuoteApi.swapPost({
      swapRequest: {
        quoteResponse,
        userPublicKey: agent.wallet_address.toString(),
        wrapAndUnwrapSol: true,
        prioritizationFeeLamports:
          agent.config.PRIORITY_LEVEL === "high" ? 1000000 : 100000,
        dynamicComputeUnitLimit: true,
      },
    });

    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    // Sign and send transaction with confirmation
    const signature = await agent.signAndSendTransaction(transaction, {
      commitment: "processed",
    });

    // Determine token symbols
    const inputTokenSymbol = isNativeSol ? "SOL" : inputMint.toString();
    const outputTokenSymbol = outputMint.toString();

    return {
      status: "success",
      transaction: signature,
      inputAmount: inputAmount,
      inputToken: inputTokenSymbol,
      outputToken: outputTokenSymbol,
      message: "Swap executed successfully",
    };
  } catch (error: any) {
    return {
      status: "error",
      transaction: "",
      inputAmount: inputAmount,
      inputToken: inputMint.toString(),
      outputToken: outputMint.toString(),
      message: `Swap failed: ${error.message}`,
      error: {
        code: error.code || "SWAP_FAILED",
        message: error.message,
      },
    };
  }
}
