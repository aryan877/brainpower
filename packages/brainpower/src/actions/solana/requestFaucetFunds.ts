import { Action } from "../../types/index.js";
import { z } from "zod";
import { ACTION_NAMES } from "../actionNames.js";
import { request_faucet_funds } from "../../tools/solana/request_faucet_funds.js";
import { BrainPowerAgent } from "src/agent/index.js";

export type RequestFaucetFundsInput = z.infer<typeof requestFaucetFundsSchema>;

const requestFaucetFundsSchema = z.object({});

const requestFaucetFundsAction: Action = {
  name: ACTION_NAMES.REQUEST_FAUCET_FUNDS,
  similes: [
    "request test sol",
    "get devnet sol",
    "request faucet",
    "airdrop sol",
    "get test tokens",
  ],
  description: "Request SOL from the Solana faucet (devnet/testnet only)",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          message: "Successfully requested 5 SOL from faucet",
        },
        explanation: "Request SOL from the Solana faucet",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: BrainPowerAgent) => {
    try {
      const signature = await request_faucet_funds(agent);

      return {
        status: "success",
        message: "Successfully requested 5 SOL from faucet",
        data: { signature },
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to request faucet funds: ${error.message}`,
        error: {
          code: "REQUEST_FAUCET_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};

export default requestFaucetFundsAction;
