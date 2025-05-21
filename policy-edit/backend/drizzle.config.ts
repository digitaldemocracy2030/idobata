import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: "../../.env" }); // Adjust path to .env if necessary

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      (() => {
        console.error(
          "DATABASE_URL is not set. Please check your environment variables."
        );
        process.exit(1);
        return "";
      })(),
  },
  verbose: true,
  strict: true,
});
