import { VersionedTransaction, PublicKey } from "@solana/web3.js";
import {
  TOKENS,
  DEFAULT_OPTIONS,
  JUP_REFERRAL_ADDRESS,
} from "../../constants/index.js";
import { getMint } from "@solana/spl-token";
import { BrainPowerAgent } from "../../agent/index.js";
import { JupiterTradeResponse } from "../../types/index.js";
import { createJupiterApiClient } from "@jup-ag/api";

/**
 * Swap tokens using Jupiter Exchange
 * @param agent SolanaAgentKit instance
 * @param outputMint Target token mint address
 * @param inputAmount Amount to swap (in token decimals)
 * @param inputMint Source token mint address (defaults to USDC)
 * @param slippageBps Slippage tolerance in basis points (default: 300 = 3%)
 * @returns Transaction signature
 */
export async function trade(
  agent: BrainPowerAgent,
  outputMint: PublicKey,
  inputAmount: number,
  inputMint: PublicKey = TOKENS.USDC,
  // @deprecated use dynamicSlippage instead
  slippageBps: number = DEFAULT_OPTIONS.SLIPPAGE_BPS,
): Promise<JupiterTradeResponse> {
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
      platformFeeBps: agent.config.JUPITER_FEE_BPS,
    });

    // Setup referral fee account if configured
    let feeAccount;
    if (agent.config.JUPITER_REFERRAL_ACCOUNT) {
      [feeAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("referral_ata"),
          new PublicKey(agent.config.JUPITER_REFERRAL_ACCOUNT).toBuffer(),
          TOKENS.SOL.toBuffer(),
        ],
        new PublicKey(JUP_REFERRAL_ADDRESS),
      );
    }

    // Get swap transaction using Jupiter API client
    const { swapTransaction } = await jupiterQuoteApi.swapPost({
      swapRequest: {
        quoteResponse,
        userPublicKey: agent.wallet_address.toString(),
        wrapAndUnwrapSol: true,
        computeUnitPriceMicroLamports:
          agent.config.PRIORITY_LEVEL === "high" ? 1000 : undefined,
        feeAccount: feeAccount?.toString(),
      },
    });

    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    const signature = await agent.signAndSendTransaction(transaction);
    const { status } = await agent.waitForTransaction(signature);

    if (status !== "confirmed") {
      throw new Error(`Transaction failed with status: ${status}`);
    }

    return { signature };
  } catch (error: any) {
    console.error("Jupiter Trade Error:", {
      error: error.message,
      inputMint: inputMint.toString(),
      outputMint: outputMint.toString(),
      inputAmount,
      slippageBps,
      walletAddress: agent.wallet_address.toString(),
      stack: error.stack,
    });
    throw new Error(`Swap failed: ${error.message}`);
  }
}
