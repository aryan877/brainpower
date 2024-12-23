import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationError } from "express-validator";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map((err: ValidationError) => ({
        field: err.type === "field" ? err.path : err.type,
        message: err.msg,
        value: err.type === "field" ? err.value : undefined,
      })),
    });
  }
  next();
};
