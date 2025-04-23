import { Router } from "express";
import {
  handleAudioUpload,
  transcribeAudio,
} from "../controllers/speechController.js";
import { authenticateUser } from "../middleware/auth/index.js";
import { asyncHandler } from "../middleware/errors/asyncHandler.js";

export function setupSpeechRoutes(router: Router): Router {
  // All speech routes require authentication
  router.use(authenticateUser);

  // Endpoint for speech-to-text transcription
  router.post(
    "/speech-to-text",
    handleAudioUpload, // Apply multer middleware first
    asyncHandler(transcribeAudio) // Then the controller
  );

  return router;
}
