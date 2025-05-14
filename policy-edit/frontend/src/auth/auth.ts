import { betterAuth } from "better-auth";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: import.meta.env.VITE_AUTH_DRIZZLE_URL,
});

export const auth = betterAuth({
  database: pool,
  secret: import.meta.env.VITE_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [],
});

export { auth as betterAuth };
