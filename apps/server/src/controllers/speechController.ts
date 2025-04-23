import { Request, RequestHandler, Response } from "express";
import multer from "multer";
import { transcribe } from "orate";
import { Groq } from "orate/groq";
import { APIError, ErrorCode } from "../middleware/errors/types.js";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    // Basic audio file type check
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(
        new APIError(
          400,
          ErrorCode.INVALID_INPUT,
          "Invalid file type. Only audio files are allowed."
        )
      );
    }
  },
});

// Middleware to handle single audio file upload
export const handleAudioUpload: RequestHandler = upload.single("audio");

// Controller function to transcribe audio
export const transcribeAudio = async (req: Request, res: Response) => {
  if (!req.file) {
    throw new APIError(400, ErrorCode.INVALID_INPUT, "No audio file provided.");
  }

  console.log("Processing audio file:", {
    mimetype: req.file.mimetype,
    size: req.file.size,
    originalname: req.file.originalname,
  });

  try {
    // Create a File-like object for orate
    const audioFile = new File([req.file.buffer], req.file.originalname, {
      type: req.file.mimetype,
    });

    // Ensure GROQ_API_KEY is set
    if (!process.env.GROQ_API_KEY) {
      throw new APIError(
        500,
        ErrorCode.INTERNAL_SERVER_ERROR,
        "GROQ API key is not configured."
      );
    }

    // Transcribe using Groq STT via orate
    const text = await transcribe({
      model: new Groq(process.env.GROQ_API_KEY).stt("whisper-large-v3-turbo"),
      audio: audioFile,
    });

    console.log("Transcribed text:", text);
    res.status(200).json({ text });
  } catch (error) {
    console.error("Speech-to-text API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Use APIError for consistent error handling
    throw new APIError(
      500,
      ErrorCode.EXTERNAL_API_ERROR,
      "Failed to transcribe audio",
      errorMessage
    );
  }
};
