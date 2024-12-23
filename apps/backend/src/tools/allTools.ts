import { ToolConfig } from "../types/index.js";
import { getBalanceTool } from "./getBalance.js";
import { getWalletAddressTool } from "./getWalletAddress.js";
import { requestFaucetFundsTool } from "./requestFaucetFunds.js";
import { transferTool } from "./sendTransfer.js";
import { createNftCollectionTool } from "./createNftCollection.js";
import { deployTokenTool } from "./deployToken.js";
import { mintNftTool } from "./mintNft.js";
import { stakeSolTool } from "./stakeSol.js";
import { tradeTool } from "./trade.js";

export const tools: Record<string, ToolConfig> = {
  get_balance: getBalanceTool,
  get_wallet_address: getWalletAddressTool,
  request_faucet_funds: requestFaucetFundsTool,
  send_transfer: transferTool,
  create_nft_collection: createNftCollectionTool,
  deploy_token: deployTokenTool,
  mint_nft: mintNftTool,
  stake_sol: stakeSolTool,
  trade_tokens: tradeTool,
};
