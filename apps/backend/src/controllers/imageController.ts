import { Response } from "express";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";
import { AuthenticatedRequest } from "../middleware/auth/index.js";
import {
  BadRequestError,
  APIError,
  ErrorCode,
} from "../middleware/errors/types.js";
import axios from "axios";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiter: 5 requests per day per IP
export const imageGenerationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day
  max: 5, // 5 requests per window
  message: {
    error: {
      code: ErrorCode.RATE_LIMIT_ERROR,
      message: "Too many image generation requests. Please try again tomorrow.",
    },
  },
});

export const generateImage = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { prompt } = req.body;

  if (!prompt) {
    throw new BadRequestError("Prompt is required");
  }

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024", // DALL-E 3 only supports 1024x1024
      quality: "standard",
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new APIError(
        500,
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to generate image URL"
      );
    }

    // Download the image
    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    // Convert to base64
    const base64Image = Buffer.from(imageResponse.data, "binary").toString(
      "base64"
    );

    return {
      success: true,
      data: {
        imageData: `data:image/png;base64,${base64Image}`,
      },
    };
  } catch (error) {
    // If it's already an APIError or BadRequestError, rethrow it
    if (error instanceof APIError || error instanceof BadRequestError) {
      throw error;
    }

    // Handle OpenAI specific errors
    if (error instanceof OpenAI.APIError) {
      // Map OpenAI error status codes to our error codes
      const statusCode = error.status || 500;
      const errorCode =
        statusCode === 400
          ? ErrorCode.BAD_REQUEST
          : ErrorCode.INTERNAL_SERVER_ERROR;

      throw new APIError(statusCode, errorCode, "Image generation failed", {
        openAiError: error.message,
        type: error.type,
        code: error.code,
      });
    }

    // Handle any other unexpected errors
    throw new APIError(
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      "Failed to generate image",
      error instanceof Error
        ? {
            message: error.message,
            stack:
              process.env.NODE_ENV === "development" ? error.stack : undefined,
          }
        : undefined
    );
  }
};
