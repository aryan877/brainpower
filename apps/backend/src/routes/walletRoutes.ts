import { Router } from "express";
import {
  storeWallet,
  getUserWallets,
} from "../controllers/walletController.js";
import { authenticateUser } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errors/asyncHandler.js";

export function setupWalletRoutes(router: Router): Router {
  router.use(authenticateUser);

  router.post("/store", asyncHandler(storeWallet));
  router.get("/", asyncHandler(getUserWallets));

  return router;
}
