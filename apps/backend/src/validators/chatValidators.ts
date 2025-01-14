import { Request, Response, NextFunction } from "express";

export function sendMessageValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { message, threadId } = req.body;

  if (!message || typeof message !== "string") {
    return res
      .status(400)
      .json({ error: "Message is required and must be a string" });
  }

  if (!threadId || typeof threadId !== "string") {
    return res
      .status(400)
      .json({ error: "Thread ID is required and must be a string" });
  }

  next();
}

export function threadHistoryValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { threadId } = req.params;

  if (!threadId || typeof threadId !== "string") {
    return res
      .status(400)
      .json({ error: "Thread ID is required and must be a string" });
  }

  next();
}

export function deleteThreadValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { threadId } = req.params;

  if (!threadId || typeof threadId !== "string") {
    return res
      .status(400)
      .json({ error: "Thread ID is required and must be a string" });
  }

  next();
}
