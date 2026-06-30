import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
// import { DATABASE_URL } from '../config.js'; // We will get this directly from process.env after dotenv
import { logger } from "../utils/logger.js";

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
const envPath = path.resolve(__dirname, "../../../../.env"); // Adjusted path to point to the project root .env
const envConfig = dotenv.config({ path: envPath });

if (envConfig.error) {
  logger.error(`Error loading .env file from ${envPath}:`, envConfig.error);
} else {
  logger.info(`.env file loaded successfully from ${envPath}`);
  if (envConfig.parsed) {
    logger.info("Parsed .env variables:", Object.keys(envConfig.parsed));
  }
}

async function runMigrations() {
  // Ensure dotenv is configured before accessing process.env.DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.error(
      "DATABASE_URL is not set in process.env. Cannot run migrations. Make sure it is set in your .env file and loaded correctly."
    );
    if (envConfig.parsed?.DATABASE_URL) {
      logger.info(
        `DATABASE_URL found in parsed .env: ${envConfig.parsed.DATABASE_URL}`
      );
    } else {
      logger.warn(
        "DATABASE_URL not found in parsed .env or .env was not parsed."
      );
    }
    process.exit(1);
  }

  logger.info(
    `Using DATABASE_URL: ${databaseUrl.substring(0, databaseUrl.indexOf("@") + 1)}...`
  ); // Log URL without credentials
  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql);

  try {
    logger.info("Starting database migrations...");
    await migrate(db, { migrationsFolder: "./drizzle/migrations" });
    logger.info("Database migrations completed successfully.");
  } catch (error) {
    logger.error("Error running database migrations:", error);
    process.exit(1);
  } finally {
    await sql.end();
    logger.info("Database connection closed.");
  }
}

runMigrations();
