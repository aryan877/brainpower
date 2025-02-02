import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BrainPowerAgent } from "src/agent/index.js";

/**
 * Get the balance of SOL or an SPL token for the agent's wallet
 * @param agent - BrainPowerAgent instance
 * @param token_address - Optional SPL token mint address. If not provided, returns SOL balance
 * @returns Promise resolving to the balance as a number (in UI units) or 0 if account doesn't exist
 */
export async function get_balance(
  agent: BrainPowerAgent,
  token_address?: PublicKey,
): Promise<number> {
  try {
    if (!token_address) {
      return (
        (await agent.connection.getBalance(agent.wallet_address)) /
        LAMPORTS_PER_SOL
      );
    }

    const tokenAccounts = await agent.connection.getTokenAccountsByOwner(
      agent.wallet_address,
      { mint: token_address },
    );

    if (tokenAccounts.value.length === 0) {
      return 0;
    }

    const firstAccount = tokenAccounts.value[0];
    if (!firstAccount) {
      return 0;
    }

    const tokenAccount = await agent.connection.getTokenAccountBalance(
      firstAccount.pubkey,
    );

    return tokenAccount.value.uiAmount || 0;
  } catch (error) {
    throw new Error(
      `Error fetching balance for ${token_address?.toString()}: ${error}`,
    );
  }
}
