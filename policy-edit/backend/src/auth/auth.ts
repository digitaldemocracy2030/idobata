import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import dotenv from "dotenv";
import { Resend } from "resend";
import { db } from "../db/db.js";
import * as schema from "../db/schema.js";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

declare module "better-auth" {
  interface BetterAuthAPI {
    signInSocial(options: {
      body: {
        provider: "github" | "google";
        callbackURL: string;
      };
    }): Promise<{ url: string }>;

    callbackOAuth(options: {
      query: {
        code: string;
      };
      params: {
        id: "github" | "google";
      };
    }): Promise<{ token: string }>;
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
    usePlural: true,
  }),
  secret:
    process.env.BETTER_AUTH_SECRET || "your-secret-key-change-in-production",
  emailAndPassword: {
    enabled: true,
  },
  oauth: {
    providers: [
      {
        id: "github",
        clientId: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      },
      {
        id: "google",
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      },
    ],
  },
  email: {
    async sendVerificationEmail({
      email,
      token,
    }: { email: string; token: string }) {
      try {
        await resend.emails.send({
          from: "noreply@yourdomain.com",
          to: email,
          subject: "メールアドレスの確認",
          html: `<p>メールアドレスを確認するには、以下のリンクをクリックしてください：</p><p><a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">メールアドレスを確認する</a></p>`,
        });
      } catch (error) {
        console.error("メール送信エラー:", error);
        throw new Error("メールの送信に失敗しました");
      }
    },
    async sendPasswordResetEmail({
      email,
      token,
    }: { email: string; token: string }) {
      try {
        await resend.emails.send({
          from: "noreply@yourdomain.com",
          to: email,
          subject: "パスワードのリセット",
          html: `<p>パスワードをリセットするには、以下のリンクをクリックしてください：</p><p><a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">パスワードをリセットする</a></p>`,
        });
      } catch (error) {
        console.error("メール送信エラー:", error);
        throw new Error("メールの送信に失敗しました");
      }
    },
  },
  plugins: [twoFactor(), nextCookies()],
});

export const authHandlers = auth.api;
