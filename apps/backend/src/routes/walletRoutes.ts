import { Router } from "express";
import {
  storeWallet,
  getUserWallets,
  getBalance,
  sendTransaction,
  getLatestBlockhash,
  simulateTransactionFee,
  getTransactionHistory,
  getAssets,
  getTokenAccount,
  getPriorityFees,
} from "../controllers/walletController.js";
import { authenticateUser } from "../middleware/auth/index.js";
import { validateCluster } from "../middleware/auth/cluster.js";
import { asyncHandler } from "../middleware/errors/asyncHandler.js";
import {
  validateStoreWallet,
  validateSendTransaction,
  validateSimulateFee,
} from "../validators/walletValidators.js";

export function setupWalletRoutes(router: Router): Router {
  router.use(authenticateUser);
  router.use(validateCluster);

  router.post("/store", validateStoreWallet, asyncHandler(storeWallet));
  router.get("/", asyncHandler(getUserWallets));
  router.get("/balance", asyncHandler(getBalance));
  router.get("/latest-blockhash", asyncHandler(getLatestBlockhash));
  router.get("/history", asyncHandler(getTransactionHistory));
  router.get("/priority-fees", asyncHandler(getPriorityFees));
  router.post("/assets", asyncHandler(getAssets));
  router.post(
    "/send-transaction",
    validateSendTransaction,
    asyncHandler(sendTransaction)
  );
  router.post(
    "/simulate-fee",
    validateSimulateFee,
    asyncHandler(simulateTransactionFee)
  );
  router.get("/token-account", asyncHandler(getTokenAccount));
  return router;
}
