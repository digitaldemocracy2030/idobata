import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "../db";
import { Auth, type Session, type User, type JWT } from "@auth/core";
import Email from "@auth/core/providers/email";

export const authConfig = {
  adapter: DrizzleAdapter(db),
  providers: [
    Email({
      server: {
        host: import.meta.env.VITE_EMAIL_SERVER_HOST,
        port: Number(import.meta.env.VITE_EMAIL_SERVER_PORT),
        auth: {
          user: import.meta.env.VITE_EMAIL_SERVER_USER,
          pass: import.meta.env.VITE_EMAIL_SERVER_PASSWORD,
        },
      },
      from: import.meta.env.VITE_EMAIL_FROM,
    }),
  ],
  secret: import.meta.env.VITE_AUTH_SECRET,
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
};

export type AuthConfig = typeof authConfig;
