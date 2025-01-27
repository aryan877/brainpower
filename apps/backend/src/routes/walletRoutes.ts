import { Router } from "express";
import {
  storeWallet,
  getUserWallets,
  getBalance,
  sendTransaction,
} from "../controllers/walletController.js";
import { authenticateUser } from "../middleware/auth/index.js";
import { validateCluster } from "../middleware/auth/cluster.js";
import { asyncHandler } from "../middleware/errors/asyncHandler.js";
import {
  validateStoreWallet,
  validateSendTransaction,
} from "../validators/walletValidators.js";

export function setupWalletRoutes(router: Router): Router {
  router.use(authenticateUser);
  router.use(validateCluster);

  router.post("/store", validateStoreWallet, asyncHandler(storeWallet));
  router.get("/", asyncHandler(getUserWallets));
  router.get("/balance", asyncHandler(getBalance));
  router.post(
    "/send-transaction",
    validateSendTransaction,
    asyncHandler(sendTransaction)
  );
  return router;
}
