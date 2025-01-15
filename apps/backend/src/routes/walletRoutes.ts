import { Router } from "express";
import {
  storeWallet,
  getUserWallets,
} from "../controllers/walletController.js";
import { authenticateUser } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errors/asyncHandler.js";

export function setupWalletRoutes(router: Router): Router {
  // Apply authentication middleware to all routes
  router.use(authenticateUser);

  // Store wallet details
  router.post(
    "/store",
    asyncHandler(async (req, res) => {
      const result = await storeWallet(req, res);
      res.json(result);
    })
  );

  // Get user's wallets
  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const result = await getUserWallets(req);
      res.json(result);
    })
  );

  return router;
}
