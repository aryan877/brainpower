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

    // Just take the first pair
    const firstPair = data.pairs[0];

    if (!firstPair?.baseToken?.address) {
      return null;
    }

    return firstPair.baseToken.address;
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
