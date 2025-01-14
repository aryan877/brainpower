import { Request, Response, NextFunction } from "express";
import { APIError, ErrorCode, ErrorResponse } from "./types.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error details
  console.error("Error:", {
    name: err.name,
    message: err.message,
    path: req.path,
    method: req.method,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });

  // Default error response
  const errorResponse: ErrorResponse = {
    error: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred",
      ...(process.env.NODE_ENV === "development" && {
        details: err.message,
      }),
    },
  };

  // Handle known API errors
  if (err instanceof APIError) {
    errorResponse.error = {
      code: err.code,
      message: err.message,
      ...(process.env.NODE_ENV === "development" && {
        details: err.details,
      }),
    };
    return res.status(err.statusCode).json(errorResponse);
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    errorResponse.error = {
      code: ErrorCode.VALIDATION_ERROR,
      message: "Validation failed",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    };
    return res.status(400).json(errorResponse);
  }

  // Handle MongoDB errors
  if (err.name === "MongoError" || err.name === "MongoServerError") {
    errorResponse.error = {
      code: ErrorCode.DATABASE_ERROR,
      message: "A database error occurred",
    };
    return res.status(500).json(errorResponse);
  }

  // Return default error response for unexpected errors
  return res.status(500).json(errorResponse);
};
