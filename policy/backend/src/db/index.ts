import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { DATABASE_URL } from "../config.js";
import { logger } from "../utils/logger.js";
import * as schema from "./schema.js";

if (!DATABASE_URL) {
  logger.error(
    "DATABASE_URL is not set. Please check your environment variables."
  );
  throw new Error(
    "DATABASE_URL is not set. Database operations will not function."
  );
}

const client = postgres(DATABASE_URL);
export const db = drizzle(client, { schema });

logger.info("Database client initialized successfully.");
