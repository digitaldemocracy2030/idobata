import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: import.meta.env.VITE_AUTH_DRIZZLE_URL,
});

export const db = drizzle(pool, { schema });
