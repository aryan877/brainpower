import { BrainPowerAgent } from "src/agent/index.js";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getMint,
} from "@solana/spl-token";
import { TransferResponse } from "../../types/index.js";

/**
 * Transfer SOL or SPL tokens to a recipient
 * @param agent SolanaAgentKit instance
 * @param to Recipient's public key
 * @param amount Amount to transfer
 * @param mint Optional mint address for SPL tokens
 * @returns TransferResponse with signature and details
 */
export async function transfer(
  agent: BrainPowerAgent,
  to: PublicKey,
  amount: number,
  mint?: PublicKey,
): Promise<TransferResponse> {
  try {
    let transaction = new Transaction();

    // Get latest blockhash
    const { blockhash } =
      await agent.connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = agent.wallet_address;

    if (!mint) {
      // Transfer native SOL
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: agent.wallet_address,
          toPubkey: to,
          lamports: amount * LAMPORTS_PER_SOL,
        }),
      );
    } else {
      // Transfer SPL token
      const fromAta = await getAssociatedTokenAddress(
        mint,
        agent.wallet_address,
      );
      const toAta = await getAssociatedTokenAddress(mint, to);

      // Get mint info to determine decimals
      const mintInfo = await getMint(agent.connection, mint);
      const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);

      transaction.add(
        createTransferInstruction(
          fromAta,
          toAta,
          agent.wallet_address,
          adjustedAmount,
        ),
      );
    }

    const signature = await agent.signAndSendTransaction(transaction);

    return {
      signature,
      amount,
      recipient: to.toString(),
      token: mint?.toString(),
    };
  } catch (error: any) {
    throw new Error(`Transfer failed: ${error.message}`);
  }
}
