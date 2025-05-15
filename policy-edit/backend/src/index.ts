// --- DEBUG: Print GitHub Env Vars ---
console.log("--- GitHub Environment Variables ---");
console.log("GITHUB_APP_ID:", process.env.GITHUB_APP_ID);
console.log("GITHUB_INSTALLATION_ID:", process.env.GITHUB_INSTALLATION_ID);
console.log("GITHUB_TARGET_OWNER:", process.env.GITHUB_TARGET_OWNER);
console.log("GITHUB_TARGET_REPO:", process.env.GITHUB_TARGET_REPO);
console.log("------------------------------------");
import cookieParser from "cookie-parser";
import cors from "cors";
// --- END DEBUG ---
import express from "express";
import { auth } from "./auth/auth.js";
import { CORS_ORIGIN, PORT } from "./config.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import { logger } from "./utils/logger.js";

interface AuthenticatedRequest extends express.Request {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Authentication middleware
const authMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value)
        headers.append(
          key,
          Array.isArray(value) ? value.join(", ") : value.toString()
        );
    }

    const session = await auth.api.getSession({
      headers,
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    (req as AuthenticatedRequest).user = session.user;
    next();
  } catch (error) {
    logger.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// Routes
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);

app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "This is a protected route",
    user: (req as AuthenticatedRequest).user,
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Unhandled error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`CORS enabled for origin: ${CORS_ORIGIN}`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});
