import { ToolConfig } from "src/types";
import { createSolanaAgent } from "../agent/createAgent.js";

interface CreateCollectionArgs {
  name: string;
  uri: string;
  royaltyBasisPoints?: number;
}

export const createNftCollectionTool: ToolConfig<CreateCollectionArgs> = {
  definition: {
    type: "function",
    function: {
      name: "create_nft_collection",
      description: "Create a brand-new NFT collection on Solana",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          uri: { type: "string" },
          royaltyBasisPoints: { type: "number" },
        },
        required: ["name", "uri"],
      },
    },
  },
  handler: async ({ name, uri, royaltyBasisPoints }) => {
    const agent = createSolanaAgent();

    const { collectionAddress } = await agent.deployCollection({
      name,
      uri,
      royaltyBasisPoints,
    });
    return { collectionAddress: collectionAddress.toString() };
  },
};
