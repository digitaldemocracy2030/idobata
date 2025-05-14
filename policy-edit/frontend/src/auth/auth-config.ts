import { db } from "../db";

export const authConfig = {
  database: db,
  secret: import.meta.env.VITE_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
};

export type AuthConfig = typeof authConfig;
