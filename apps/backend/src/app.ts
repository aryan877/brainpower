import express, { Express } from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { setupChatRoutes } from "./routes/chatRoutes.js";
import { setupWalletRoutes } from "./routes/walletRoutes.js";
import { setupIPFSRoutes } from "./routes/ipfsRoutes.js";
import { setupImageRoutes } from "./routes/imageRoutes.js";
import { setupCookie3Routes } from "./routes/cookie3Routes.js";
import { errorHandler } from "./middleware/errors/errorHandler.js";
import { notFoundHandler } from "./middleware/errors/notFoundHandler.js";
import { ErrorCode, ErrorResponse } from "./middleware/errors/types.js";
import cookieParser from "cookie-parser";

const app: Express = express();
const httpServer = createServer(app);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-solana-cluster"],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: {
      code: ErrorCode.RATE_LIMIT_ERROR,
      message: "Too many requests, please try again later",
    },
  } as ErrorResponse,
});
app.use(limiter);

// Add cookie parser middleware before routes
app.use(cookieParser());

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Brainpower Backend!" });
});

// Health check endpoint
app.get("/health", (req, res) => {
  const healthcheck = {
    status: "ok",
    timestamp: new Date(),
    uptime: process.uptime(),
    mongoConnection:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    environment: process.env.NODE_ENV,
  };

  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.status = "error";
    res.status(503).json(healthcheck);
  }
});

// Initialize OpenAI client

// Setup routes
const router = express.Router();

// Initialize routes
export const initializeRoutes = async () => {
  app.use("/api/chat", setupChatRoutes(router));
  app.use("/api/wallet", setupWalletRoutes(express.Router()));
  app.use("/api/ipfs", setupIPFSRoutes(express.Router()));
  app.use("/api/image", setupImageRoutes(express.Router()));
  app.use("/api/cookie3", setupCookie3Routes(express.Router()));
  console.log("🛠️ Routes configured");

  // Handle 404 for undefined routes
  app.use("*", notFoundHandler);

  // Global error handler - should be last
  app.use(errorHandler);
};

// Database connection
export const connectDB = async () => {
  const MONGODB_URI =
    process.env.NODE_ENV === "production"
      ? process.env.MONGODB_PROD_URI
      : process.env.MONGODB_TEST_URI ||
        "mongodb://localhost:27017/solana-ai-chat";

  if (!MONGODB_URI) {
    throw new Error("MongoDB URI is not defined");
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log(
      `📦 Connected to MongoDB (${process.env.NODE_ENV} environment)`
    );
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

// Graceful shutdown handler
export const gracefulShutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

export { app, httpServer };
