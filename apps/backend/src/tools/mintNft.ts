import { ToolConfig } from "src/types";
import { createSolanaAgent } from "../agent/createAgent.js";
import { PublicKey } from "@solana/web3.js";

interface MintNftArgs {
  collectionMint: string; // existing collection address
  name: string;
  uri: string;
  recipient?: string; // optional
}

export const mintNftTool: ToolConfig<MintNftArgs> = {
  definition: {
    type: "function",
    function: {
      name: "mint_nft",
      description: "Mint a new NFT into an existing collection",
      parameters: {
        type: "object",
        properties: {
          collectionMint: { type: "string" },
          name: { type: "string" },
          uri: { type: "string" },
          recipient: { type: "string" },
        },
        required: ["collectionMint", "name", "uri"],
      },
    },
  },
  handler: async ({ collectionMint, name, uri, recipient }) => {
    const agent = createSolanaAgent();

    const minted = await agent.mintNFT(
      new PublicKey(collectionMint),
      { name, uri },
      recipient ? new PublicKey(recipient) : undefined
    );

    return { nftMint: minted.mint.toString() };
  },
};
