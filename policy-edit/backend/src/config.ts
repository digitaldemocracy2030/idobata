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

// CORS settings
export const CORS_ORIGIN =
  process.env.POLICY_CORS_ORIGIN || "http://localhost:5174";

// Database configuration
export const DATABASE_URL = process.env.DATABASE_URL;

// Research service model configuration
export const OPENAI_DEFAULT_MODEL =
  process.env.OPENAI_DEFAULT_MODEL || "gpt-3.5-turbo";
export const GEMINI_DEFAULT_MODEL =
  process.env.GEMINI_DEFAULT_MODEL || "gemini-2.5-pro-preview-03-25";
export const CLAUDE_DEFAULT_MODEL =
  process.env.CLAUDE_DEFAULT_MODEL || "claude-3-opus-20240229";
export const RESEARCH_DEFAULT_MODEL =
  process.env.RESEARCH_DEFAULT_MODEL || "google/gemini-2.5-pro-preview-03-25";
export const SYNTHESIS_DEFAULT_MODEL =
  process.env.SYNTHESIS_DEFAULT_MODEL || "anthropic/claude-3-opus-20240229";

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
