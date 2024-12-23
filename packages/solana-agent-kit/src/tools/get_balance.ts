import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";

/**
 * Get the balance of SOL or an SPL token for a wallet
 * @param agent - SolanaAgentKit instance
 * @param token_address - Optional SPL token mint address. If not provided, returns SOL balance
 * @returns Promise resolving to the balance as a number (in UI units) or 0 if account doesn't exist
 */
export async function get_balance(
  agent: SolanaAgentKit,
  token_address?: PublicKey
): Promise<number> {
  try {
    if (!token_address) {
      const balance = await agent.connection.getBalance(agent.wallet_address);
      return balance / LAMPORTS_PER_SOL;
    }

    const token_accounts = await agent.connection.getTokenAccountsByOwner(
      agent.wallet_address,
      {
        mint: token_address,
      }
    );

    if (!token_accounts?.value?.length) {
      return 0;
    }

    try {
      const token_account = await agent.connection.getTokenAccountBalance(
        token_accounts.value[0].pubkey
      );

      if (
        token_account?.value?.uiAmount === null ||
        token_account?.value?.uiAmount === undefined
      ) {
        return 0;
      }

      return token_account.value.uiAmount;
    } catch (error) {
      console.error("Error getting token account balance:", error);
      return 0;
    }
  } catch (error) {
    console.error("Error in get_balance:", error);
    return 0;
  }
}
