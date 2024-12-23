import { Router, Request, Response } from "express";
import { tools } from "../tools/allTools.js";

export function setupToolRoutes() {
  const router = Router();

  router.get("/", (req: Request, res: Response) => {
    try {
      const templateTools = Object.entries(tools).map(([key, tool]) => {
        const { definition } = tool;
        const { description, parameters } = definition.function;

        // Create template format
        const template = {
          category: getToolCategory(key),
          name: formatToolName(key),
          description,
          template: generateTemplate(key, parameters),
        };

        return template;
      });

      res.json(templateTools);
    } catch (error) {
      console.error("Error processing tools:", error);
      res.status(500).json({ error: "Failed to process tools" });
    }
  });

  return router;
}

// Helper function to categorize tools
function getToolCategory(toolName: string): string {
  const categories: Record<string, string> = {
    get_wallet_address: "Wallet & Balance",
    get_balance: "Wallet & Balance",
    request_faucet_funds: "Wallet & Balance",
    send_transfer: "Wallet & Balance",

    create_nft_collection: "NFT",
    mint_nft: "NFT",
    create_image: "NFT",

    deploy_token: "Tokens",
    get_token_data: "Tokens",
    launch_pumpfun_token: "Tokens",

    trade_tokens: "DeFi",
    lend_asset: "DeFi",
    pyth_fetch_price: "DeFi",

    stake_sol: "Staking",
    stake_with_jup: "Staking",

    create_orca_whirlpool: "Liquidity",
    raydium_create_ammv4: "Liquidity",
    raydium_create_clmm: "Liquidity",
    raydium_create_cpmm: "Liquidity",

    get_tps: "Utility",
    register_domain: "Utility",
    telegram_notify: "Utility",
  };

  return categories[toolName] || "Other";
}

// Helper function to format tool name for display
function formatToolName(toolName: string): string {
  return toolName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper function to generate template string from parameters
function generateTemplate(toolName: string, parameters: any): string {
  const requiredParams = parameters.required || [];
  const properties = parameters.properties || {};

  let template = toolName;

  if (requiredParams.length > 0) {
    template += " with";
    requiredParams.forEach((param: string) => {
      const prop = properties[param];
      template += ` {${param.toUpperCase()}}`;

      if (requiredParams.indexOf(param) !== requiredParams.length - 1) {
        template += " and";
      }
    });
  }

  return template;
}
