import { Action } from "../../types/index.js";
import { z } from "zod";
import { ACTION_NAMES } from "../actionNames.js";
import { closeEmptyTokenAccounts } from "../../tools/solana/close_empty_token_accounts.js";
import { BrainPowerAgent } from "src/agent/index.js";

export type CloseEmptyTokenAccountsInput = z.infer<
  typeof closeEmptyTokenAccountsSchema
>;

const closeEmptyTokenAccountsSchema = z.object({});

const closeEmptyTokenAccountsAction: Action = {
  name: ACTION_NAMES.CLOSE_EMPTY_TOKEN_ACCOUNTS,
  similes: [
    "close empty token accounts",
    "clean up token accounts",
    "remove empty token accounts",
    "close unused token accounts",
    "cleanup wallet",
  ],
  description:
    "Close all empty SPL token accounts in the wallet to save rent fees",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          size: 5,
          message: "Successfully closed 5 empty token accounts",
        },
        explanation: "Closes all empty token accounts in the wallet",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: BrainPowerAgent) => {
    try {
      const result = await closeEmptyTokenAccounts(agent);

      if (result.size === 0) {
        return {
          status: "success",
          message: "No empty token accounts found to close",
          data: result,
        };
      }

      return {
        status: "success",
        message: `Successfully closed ${result.size} empty token accounts`,
        data: result,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to close empty token accounts: ${error.message}`,
        error: {
          code: "CLOSE_ACCOUNTS_ERROR",
          message: error.message,
          details: error,
        },
      };
    }
  },
};

export default closeEmptyTokenAccountsAction;
