import { ToolConfig } from "src/types/index.js";
import { getBalanceTool } from "./getBalance.js";
import { getWalletAddressTool } from "./getWalletAddress.js";
import { requestFaucetFundsTool } from "./requestFaucetFunds.js";
import { transferTool } from "./sendTransfer.js";
import { createNftCollectionTool } from "./createNftCollection.js";
import { deployTokenTool } from "./deployToken.js";
import { mintNftTool } from "./mintNft.js";
import { stakeSolTool } from "./stakeSol.js";
import { tradeTool } from "./trade.js";
import { createImageTool } from "./createImage.js";
import { getTPSTool } from "./getTPS.js";
import { launchPumpFunTokenTool } from "./launchPumpFunToken.js";
import { lendTool } from "./lend.js";
import { pythFetchPriceTool } from "./pythFetchPrice.js";
import { getTokenDataTool } from "./getTokenData.js";
import { raydiumCreateAmmV4Tool } from "./raydiumCreateAmmV4.js";
import { raydiumCreateClmmTool } from "./raydiumCreateClmm.js";
import { raydiumCreateCpmmTool } from "./raydiumCreateCpmm.js";
import { registerDomainTool } from "./registerDomain.js";
import { stakeWithJupTool } from "./stakeWithJup.js";
import { createOrcaWhirlpoolTool } from "./createOrcaWhirlpool.js";
import { telegramNotifyTool } from "./telegramNotify.js";

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
  create_image: createImageTool,
  get_tps: getTPSTool,
  launch_pumpfun_token: launchPumpFunTokenTool,
  lend_asset: lendTool,
  pyth_fetch_price: pythFetchPriceTool,
  get_token_data: getTokenDataTool,
  raydium_create_ammv4: raydiumCreateAmmV4Tool,
  raydium_create_clmm: raydiumCreateClmmTool,
  raydium_create_cpmm: raydiumCreateCpmmTool,
  register_domain: registerDomainTool,
  stake_with_jup: stakeWithJupTool,
  create_orca_whirlpool: createOrcaWhirlpoolTool,
  telegram_notify: telegramNotifyTool,
};
