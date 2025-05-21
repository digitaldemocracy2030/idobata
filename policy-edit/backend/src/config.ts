import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Server configuration
export const PORT = process.env.PORT || 3001;
export const NODE_ENV = process.env.NODE_ENV || "development";

// OpenRouter API configuration
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// GitHub repository settings
export const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER;
export const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME;
export const GITHUB_BASE_BRANCH = process.env.GITHUB_BASE_BRANCH || "main";
export const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
export const GITHUB_INSTALLATION_ID = process.env.GITHUB_INSTALLATION_ID;
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// CORS settings
export const CORS_ORIGIN =
  process.env.POLICY_CORS_ORIGIN || "http://localhost:5174";

// Database configuration
export const DATABASE_URL = process.env.DATABASE_URL;

// Validate required environment variables
if (!OPENROUTER_API_KEY) {
  console.warn(
    "OPENROUTER_API_KEY is not set. The chatbot will not function properly."
  );
}
if (!DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set. Database operations will not function."
  );
}
