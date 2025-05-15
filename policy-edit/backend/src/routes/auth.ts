import express from "express";
import { auth } from "../auth/auth.js";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    res.status(201).json({ success: true, message: "ユーザー登録が完了しました。メールを確認してください。" });
  } catch (error: unknown) {
    console.error("Signup error:", error);
    const errorMessage = error instanceof Error ? error.message : "ユーザー登録に失敗しました";
    res.status(400).json({ success: false, message: errorMessage });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "ユーザーが見つかりません" });
    }

    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    const token = result.token;
    res.cookie("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: unknown) {
    console.error("Signin error:", error);
    const errorMessage = error instanceof Error ? error.message : "ログインに失敗しました";
    res.status(400).json({ success: false, message: errorMessage });
  }
});

router.post("/signout", async (req, res) => {
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.append(key, Array.isArray(value) ? value.join(', ') : value.toString());
    }

    await auth.api.signOut({
      headers,
    });

    res.clearCookie("session");
    
    res.status(200).json({ success: true, message: "ログアウトしました" });
  } catch (error: unknown) {
    console.error("Signout error:", error);
    const errorMessage = error instanceof Error ? error.message : "ログアウトに失敗しました";
    res.status(400).json({ success: false, message: errorMessage });
  }
});

router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== "string") {
      return res.status(400).json({ success: false, message: "無効なトークンです" });
    }

    await auth.api.verifyEmail({
      query: {
        token,
      },
    });

    res.status(200).json({ success: true, message: "メールアドレスが確認されました" });
  } catch (error: unknown) {
    console.error("Email verification error:", error);
    const errorMessage = error instanceof Error ? error.message : "メールアドレスの確認に失敗しました";
    res.status(400).json({ success: false, message: errorMessage });
  }
});

router.get("/oauth/:provider", async (req, res) => {
  try {
    const { provider } = req.params;

    const allowedProviders = ["github", "google"] as const;
    type AllowedProvider = typeof allowedProviders[number];
    
    if (!allowedProviders.includes(provider as AllowedProvider)) {
      return res.status(400).json({ success: false, message: "無効なプロバイダーです" });
    }

    const api = auth.api as any;
    const result = await api.signInSocial({
      body: {
        provider: provider as "github" | "google",
        callbackURL: `${process.env.BACKEND_URL}/auth/oauth/callback/${provider}`,
      },
    });

    if (!result || !result.url) {
      return res.status(400).json({ success: false, message: "認証URLの生成に失敗しました" });
    }

    res.status(200).json({ success: true, url: result.url });
  } catch (error: unknown) {
    console.error("OAuth initiation error:", error);
    const errorMessage = error instanceof Error ? error.message : "OAuth認証の開始に失敗しました";
    res.status(400).json({ success: false, message: errorMessage });
  }
});

router.get("/oauth/callback/:provider", async (req, res) => {
  try {
    const { provider } = req.params;
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ success: false, message: "無効なコードです" });
    }

    const allowedProviders = ["github", "google"] as const;
    type AllowedProvider = typeof allowedProviders[number];
    
    if (!allowedProviders.includes(provider as AllowedProvider)) {
      return res.status(400).json({ success: false, message: "無効なプロバイダーです" });
    }

    const api = auth.api as any;
    const result = await api.callbackOAuth({
      query: {
        code,
      },
      params: {
        id: provider as "github" | "google",
      },
    });

    if (!result || !result.token) {
      return res.status(400).json({ success: false, message: "認証に失敗しました" });
    }

    res.cookie("session", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.redirect(`${process.env.FRONTEND_URL}/`);
  } catch (error: unknown) {
    console.error("OAuth callback error:", error);
    const errorMessage = error instanceof Error ? error.message : "OAuth認証に失敗しました";
    res.status(400).json({ success: false, message: errorMessage });
  }
});

router.get("/me", async (req, res) => {
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.append(key, Array.isArray(value) ? value.join(', ') : value.toString());
    }

    const session = await auth.api.getSession({
      headers,
    });

    if (!session) {
      return res.status(401).json({ success: false, message: "認証されていません" });
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.user.id),
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "ユーザーが見つかりません" });
    }

    res.status(200).json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: unknown) {
    console.error("Get current user error:", error);
    const errorMessage = error instanceof Error ? error.message : "認証されていません";
    res.status(401).json({ success: false, message: errorMessage });
  }
});

export default router;
