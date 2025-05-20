import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  LOG_LEVEL: z.string().optional(),
  GITHUB_APP_ID: z.string(),
  GITHUB_INSTALLATION_ID: z.string(),
  GITHUB_TARGET_OWNER: z.string(),
  GITHUB_TARGET_REPO: z.string(),
  GITHUB_BASE_BRANCH: z.string().default("main"),
  GITHUB_API_BASE_URL: z.string().optional(), // GHE用
  OPENROUTER_API_KEY: z.string(), // OpenRouter APIキーを追加
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsedEnv.error.format(), null, 4)
  );
  process.exit(1);
}

export default parsedEnv.data;
