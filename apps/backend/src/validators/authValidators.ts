import { body, param, ValidationChain } from "express-validator";
import { validateRequest } from "./validateRequest.js";

export const nonceValidator = [
  body("walletAddress")
    .trim()
    .notEmpty()
    .withMessage("Wallet address is required")
    .matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
    .withMessage("Invalid Solana wallet address format"),
  validateRequest,
];

export const verifySignatureValidator = [
  body("walletAddress")
    .trim()
    .notEmpty()
    .withMessage("Wallet address is required")
    .matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
    .withMessage("Invalid Solana wallet address format"),
  body("signature")
    .trim()
    .notEmpty()
    .withMessage("Signature is required")
    .isBase58()
    .withMessage("Signature must be in base58 format"),
  validateRequest,
];

export const updateUsernameValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
  validateRequest,
];
