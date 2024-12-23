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
import { setupToolRoutes } from "./api/toolsRoutes.js";

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
        ? process.env.FRONTEND_URL
        : ["http://localhost:3000", "http://localhost:5000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
);

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("📦 Connected to MongoDB"))
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

async function main() {
  try {
    // Initialize OpenAI assistant
    const assistant = await createAssistant(client);
    console.log("🤖 OpenAI Assistant initialized");

    // Setup routes
    const chatRouter = express.Router();
    const chatRoutes = setupChatRoutes(chatRouter, client, assistant);
    const toolsRouter = setupToolRoutes();

    app.use("/api/chat", chatRoutes);
    app.use("/api/tools", toolsRouter);
    console.log("🛠️ Routes configured");

    // 404 handler
    app.use((req: express.Request, res: express.Response) => {
      res.status(404).json({
        error: "Not Found",
        path: req.path,
        method: req.method,
      });
    });

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
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
    console.error("Error in main:", error);
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
  console.error("Unhandled error:", error);
  process.exit(1);
});
