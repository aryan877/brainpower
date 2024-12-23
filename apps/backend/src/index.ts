import "dotenv/config";
import OpenAI from "openai";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createAssistant } from "./core/createAssistant.js";
import { createThread } from "./core/createThread.js";
import { startTerminalChat } from "./terminal/terminalChat.js";
import { setupChatRoutes } from "./api/chatRoutes.js";

const client = new OpenAI();
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/solana-ai-chat";

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"]
        : ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parser middleware with error handling
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// JSON parsing error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({
        error: "Invalid JSON in request body",
        details: err.message,
      });
    }
    next(err);
  }
);

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

async function main() {
  try {
    // Initialize OpenAI assistant
    const assistant = await createAssistant(client);

    // Setup routes
    setupChatRoutes(app, client, assistant);

    // General error handling middleware
    app.use(
      (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error("Error details:", {
          message: err.message,
          stack: err.stack,
          name: err.name,
        });

        // Send appropriate error response
        res.status(500).json({
          error: "An error occurred while processing your request",
          details: err.message,
          type: err.name,
          ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        });
      }
    );

    // 404 handler
    app.use((req: express.Request, res: express.Response) => {
      res.status(404).json({
        error: "Not Found",
        details: `Cannot ${req.method} ${req.url}`,
      });
    });

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Start terminal chat if CLI_MODE is enabled
    if (process.env.CLI_MODE === "true") {
      const thread = await createThread(client);
      console.log(
        'Terminal chat started! Type "exit" to end the conversation.'
      );
      await startTerminalChat(thread, assistant, client);
    }
  } catch (error) {
    console.error(
      "Error in main:",
      error instanceof Error ? error.message : "Unknown error"
    );
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

main().catch((error) => {
  console.error(
    "Unhandled error:",
    error instanceof Error ? error.message : "Unknown error"
  );
  process.exit(1);
});
