import { LAMPORTS_PER_SOL, type PublicKey } from "@solana/web3.js";
import { BrainPowerAgent } from "src/agent/index.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getTokenMetadata } from "../../utils/tokenMetadata.js";
import { TokenBalancesResponse } from "../../types/index.js";

/**
 * Get the token balances of a Solana wallet
 * @param agent - SolanaAgentKit instance
 * @param walletAddress - Optional wallet address to check balances for. If not provided, uses agent's wallet address
 * @returns Promise resolving to TokenBalancesResponse containing SOL balance and token balances
 */
export async function get_token_balance(
  agent: BrainPowerAgent,
  walletAddress?: PublicKey,
): Promise<TokenBalancesResponse> {
  const [lamportsBalance, tokenAccountData] = await Promise.all([
    agent.connection.getBalance(walletAddress ?? agent.wallet_address),
    agent.connection.getParsedTokenAccountsByOwner(
      walletAddress ?? agent.wallet_address,
      {
        programId: TOKEN_PROGRAM_ID,
      },
    ),
  ]);

  const removedZeroBalance = tokenAccountData.value.filter(
    (v) => v.account.data.parsed.info.tokenAmount.uiAmount !== 0,
  );

  const tokens = await Promise.all(
    removedZeroBalance.map(async (v) => {
      const mint = v.account.data.parsed.info.mint;
      const mintInfo = await getTokenMetadata(agent.connection, mint);
      return {
        tokenAddress: mint,
        name: mintInfo.name ?? "",
        symbol: mintInfo.symbol ?? "",
        balance: v.account.data.parsed.info.tokenAmount.uiAmount as number,
        decimals: v.account.data.parsed.info.tokenAmount.decimals as number,
      };
    }),
  );

  return {
    sol: lamportsBalance / LAMPORTS_PER_SOL,
    tokens,
  };
}
