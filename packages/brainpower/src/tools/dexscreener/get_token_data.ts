import { PublicKey } from "@solana/web3.js";
import { JupiterTokenData } from "../../types/index.js";
import { NATIVE_MINT } from "@solana/spl-token";

export async function getTokenDataByAddress(
  mint: PublicKey,
): Promise<JupiterTokenData | undefined> {
  try {
    if (!mint) {
      throw new Error("Mint address is required");
    }

    const response = await fetch(`https://tokens.jup.ag/token/${mint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const token = (await response.json()) as JupiterTokenData;
    return token;
  } catch (error: any) {
    throw new Error(`Error fetching token data: ${error.message}`);
  }
}

export async function getTokenAddressFromTicker(
  ticker: string,
): Promise<string | null> {
  try {
    if (!ticker || typeof ticker !== "string") {
      console.error("Invalid ticker provided");
      return null;
    }

    // Special handling for SOL ticker
    if (ticker.toUpperCase() === "SOL") {
      return NATIVE_MINT.toBase58();
    }

    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(ticker)}`,
    );

    if (!response.ok) {
      console.error(
        `DexScreener API error: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.pairs) || data.pairs.length === 0) {
      console.error(
        "Invalid response format from DexScreener or no pairs found",
      );
      return null;
    }

    // Score and sort pairs based on multiple metrics
    const scoredPairs = data.pairs.map((pair) => {
      let score = 0;

      // Liquidity score (0-40 points)
      score += Math.min(40, (pair.liquidity?.usd || 0) / 25000);

      // Volume score (0-30 points)
      score += Math.min(30, (pair.volume?.h24 || 0) / 100000);

      // Transaction count score (0-20 points)
      const txCount =
        (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0);
      score += Math.min(20, txCount / 100);

      // Price stability score (0-10 points)
      const priceChange = Math.abs(pair.priceChange?.h24 || 0);
      score += Math.max(0, 10 - priceChange / 2);

      return {
        pair,
        score,
      };
    });

    // Sort by score descending
    scoredPairs.sort((a, b) => b.score - a.score);

    // Return the address of the highest scoring pair
    const bestPair = scoredPairs[0]?.pair;
    if (!bestPair?.baseToken?.address) {
      return null;
    }

    return bestPair.baseToken.address;
  } catch (error) {
    console.error("Error fetching token address from DexScreener:", error);
    return null;
  }
}

export async function getTokenDataByTicker(
  ticker: string,
): Promise<JupiterTokenData | undefined> {
  const address = await getTokenAddressFromTicker(ticker);
  if (!address) {
    throw new Error(`Token address not found for ticker: ${ticker}`);
  }
  return getTokenDataByAddress(new PublicKey(address));
}
