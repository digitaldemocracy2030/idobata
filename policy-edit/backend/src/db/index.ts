import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";

const pool = new Pool({
  connectionString: process.env.AUTH_DRIZZLE_URL,
});

export const db = drizzle(pool, { schema });
