import { body, param, ValidationChain } from "express-validator";
import { validateRequest } from "./validateRequest.js";

export const createThreadValidator = [validateRequest];

export const sendMessageValidator = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isString()
    .withMessage("Message must be a string")
    .isLength({ max: 4000 })
    .withMessage("Message cannot exceed 4000 characters"),
  body("threadId")
    .trim()
    .notEmpty()
    .withMessage("Thread ID is required")
    .isString()
    .withMessage("Thread ID must be a string"),
  validateRequest,
];

export const threadHistoryValidator = [
  param("threadId")
    .trim()
    .notEmpty()
    .withMessage("Thread ID is required")
    .isString()
    .withMessage("Thread ID must be a string"),
  validateRequest,
];

export const deleteThreadValidator = [
  param("threadId")
    .trim()
    .notEmpty()
    .withMessage("Thread ID is required")
    .isString()
    .withMessage("Thread ID must be a string"),
  validateRequest,
];
