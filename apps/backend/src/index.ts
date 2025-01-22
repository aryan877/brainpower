import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Log environment configuration
console.log("Environment Variables:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log(
  "MONGODB_PROD_URI:",
  process.env.MONGODB_PROD_URI ? "Set" : "Not Set"
);
console.log(
  "MONGODB_TEST_URI:",
  process.env.MONGODB_TEST_URI ? "Set" : "Not Set"
);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

import {
  httpServer,
  connectDB,
  initializeRoutes,
  gracefulShutdown,
} from "./app.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to database
    await connectDB();

    // Initialize routes and middleware
    await initializeRoutes();

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Start the server
startServer();
