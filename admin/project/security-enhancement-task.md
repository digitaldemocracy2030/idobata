# HttpOnly Cookie 認証と CSRF 保護の実装計画

## 現状の問題点

現在の admin ページのログイン機構には以下のセキュリティ上の問題があります：

1. **JWT トークンが localStorage に保存されている**

   - XSS（クロスサイトスクリプティング）攻撃に対して脆弱
   - JavaScript からアクセス可能なため、攻撃者がトークンを盗むことが可能

2. **CSRF 保護の欠如**

   - クロスサイトリクエストフォージェリ攻撃に対して脆弱
   - 認証済みユーザーの権限で悪意のあるリクエストが実行される可能性

3. **その他のセキュリティリスク**
   - レート制限の欠如（ブルートフォース攻撃に脆弱）
   - 多要素認証の欠如
   - トークン無効化メカニズムの欠如

## 改善策：HttpOnly Cookie 認証と CSRF 保護

### ライブラリの選択

#### バックエンド（Node.js/Express）

1. **Cookie 管理**

   - **cookie-parser**: Express でクッキーを解析するための標準ライブラリ
   - **express-session**: セッション管理のための包括的なソリューション（より高度な機能が必要な場合）

2. **CSRF 保護**

   - **csrf-csrf**: 柔軟で設定可能な CSRF 保護ライブラリ（二重送信クッキーパターン）

3. **認証管理**
   - **jsonwebtoken**: JWT の生成と検証のためのライブラリ（現在使用中）

#### フロントエンド（React）

1. **HTTP 通信**
   - **axios**: 高機能な HTTP クライアント（クッキー対応、インターセプター機能あり）

## 実装計画

### 1. バックエンドの実装

#### a. 必要なライブラリのインストール

```bash
npm install cookie-parser csrf-csrf
```

#### b. サーバー設定（server.js）

```javascript
import express from "express";
import cookieParser from "cookie-parser";
import { doubleCsrf } from "csrf-csrf";
import cors from "cors";

const app = express();

// ミドルウェアの設定
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET)); // クッキーの署名に使用する秘密鍵

// CORS設定（開発環境と本番環境で分ける）
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://yourdomain.com"
        : "http://localhost:5173",
    credentials: true, // クッキーを許可
  })
);

// CSRF保護の設定
const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  cookieName: "csrf_token",
  cookieOptions: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
  size: 64, // トークンのサイズ
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});

// CSRFトークン取得エンドポイント
app.get("/api/auth/csrf-token", (req, res) => {
  res.json({ csrfToken: generateToken(req, res) });
});

// CSRF保護を適用するルート
app.use("/api/auth", doubleCsrfProtection, authRoutes);

// その他のルート設定
// ...

export default app;
```

#### c. 認証コントローラーの修正（authController.js）

```javascript
import jwt from "jsonwebtoken";
import AdminUser from "../models/AdminUser.js";
import authService from "../services/auth/authService.js";

// ログイン処理
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "メールアドレスとパスワードを入力してください",
      });
    }

    try {
      const { user, token } = await authService.authenticate("local", {
        email,
        password,
      });

      // JWTをHttpOnly Cookieとして設定
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: parseInt(process.env.JWT_EXPIRES_IN || "86400") * 1000, // ミリ秒に変換
        path: "/",
      });

      // ユーザー情報のみを返す（トークンはCookieに設定済み）
      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[AuthController] Authentication error:", error);
      return res.status(401).json({ message: "認証に失敗しました" });
    }
  } catch (error) {
    console.error("[AuthController] Login error:", error);
    res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
};

// ログアウト処理
const logout = (req, res) => {
  res.cookie("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    expires: new Date(0),
    path: "/",
  });

  res.json({ message: "ログアウトしました" });
};

// 現在のユーザー情報取得
const getCurrentUser = async (req, res) => {
  // 既存の実装と同じ
};

// 他のメソッドも同様に実装

export { login, logout, getCurrentUser, createAdminUser, initializeAdminUser };
```

#### d. 認証ミドルウェアの修正（authMiddleware.js）

```javascript
import AdminUser from "../models/AdminUser.js";
import authService from "../services/auth/authService.js";

export const protect = async (req, res, next) => {
  try {
    // Cookieからトークンを取得
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: "認証が必要です" });
    }

    try {
      const decoded = authService.verifyToken(token);

      const user = await AdminUser.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "ユーザーが見つかりません" });
      }

      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      return res.status(401).json({ message: "トークンが無効です" });
    }
  } catch (error) {
    console.error("[AuthMiddleware] Protect error:", error);
    res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
};

export const admin = (req, res, next) => {
  // 既存の実装と同じ
};
```

### 2. フロントエンドの実装

#### a. 必要なライブラリのインストール

```bash
npm install axios
```

#### b. API クライアントの実装（apiClient.ts）

```typescript
import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { ApiError, ApiErrorType } from "./apiError";
import type {
  CreateThemePayload,
  CreateUserPayload,
  LoginCredentials,
  LoginResponse,
  Theme,
  UpdateThemePayload,
  UserResponse,
} from "./types";
import { Result, err, ok } from "neverthrow";

export type ApiResult<T> = Result<T, ApiError>;

export class ApiClient {
  private api: AxiosInstance;
  private csrfToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // クッキーを含める
    });

    // レスポンスインターセプター
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // 401エラーの場合、CSRFトークンが無効かもしれないので再取得
        if (error.response?.status === 401) {
          this.csrfToken = null;
        }
        return Promise.reject(error);
      }
    );
  }

  // CSRFトークンを取得
  private async ensureCSRFToken(): Promise<string> {
    if (!this.csrfToken) {
      const response = await this.api.get<{ csrfToken: string }>(
        "/auth/csrf-token"
      );
      this.csrfToken = response.data.csrfToken;
    }
    return this.csrfToken;
  }

  // APIリクエスト共通処理
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<ApiResult<T>> {
    try {
      // 変更が必要なリクエストの場合、CSRFトークンを取得
      let headers = {};
      if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
        const token = await this.ensureCSRFToken();
        headers = { "X-CSRF-Token": token };
      }

      const response = await this.api.request<T>({
        method,
        url: endpoint,
        data,
        headers,
      });

      return ok(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status || 0;
        const message =
          (axiosError.response?.data as any)?.message ||
          axiosError.message ||
          "Unknown error";

        let errorType: ApiErrorType;
        switch (status) {
          case 400:
            errorType = ApiErrorType.VALIDATION_ERROR;
            break;
          case 401:
            errorType = ApiErrorType.UNAUTHORIZED;
            break;
          case 403:
            errorType = ApiErrorType.FORBIDDEN;
            break;
          case 404:
            errorType = ApiErrorType.NOT_FOUND;
            break;
          case 500:
          case 502:
          case 503:
            errorType = ApiErrorType.SERVER_ERROR;
            break;
          default:
            errorType = ApiErrorType.UNKNOWN_ERROR;
        }

        return err(new ApiError(errorType, message, status));
      }

      return err(
        new ApiError(
          ApiErrorType.NETWORK_ERROR,
          error instanceof Error ? error.message : "Network error occurred"
        )
      );
    }
  }

  // 各APIメソッド
  async getAllThemes(): Promise<ApiResult<Theme[]>> {
    return this.request<Theme[]>("GET", "/themes");
  }

  async getThemeById(id: string): Promise<ApiResult<Theme>> {
    return this.request<Theme>("GET", `/themes/${id}`);
  }

  async createTheme(theme: CreateThemePayload): Promise<ApiResult<Theme>> {
    return this.request<Theme>("POST", "/themes", theme);
  }

  async updateTheme(
    id: string,
    theme: UpdateThemePayload
  ): Promise<ApiResult<Theme>> {
    return this.request<Theme>("PUT", `/themes/${id}`, theme);
  }

  async deleteTheme(id: string): Promise<ApiResult<{ message: string }>> {
    return this.request<{ message: string }>("DELETE", `/themes/${id}`);
  }

  async login(
    email: string,
    password: string
  ): Promise<ApiResult<LoginResponse>> {
    return this.request<LoginResponse>("POST", "/auth/login", {
      email,
      password,
    });
  }

  async logout(): Promise<ApiResult<{ message: string }>> {
    return this.request<{ message: string }>("POST", "/auth/logout");
  }

  async getCurrentUser(): Promise<ApiResult<UserResponse>> {
    return this.request<UserResponse>("GET", "/auth/me");
  }

  async createUser(
    userData: CreateUserPayload
  ): Promise<ApiResult<UserResponse>> {
    return this.request<UserResponse>("POST", "/auth/users", userData);
  }
}

export const apiClient = new ApiClient();
```

#### c. 認証コンテキストの修正（AuthContext.tsx）

```typescript
import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "../services/api/apiClient";
import type { User } from "../services/api/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const result = await apiClient.getCurrentUser();
        if (result.isOk()) {
          setUser(result.value.user);
        }
      } catch (error) {
        console.error("Failed to get current user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await apiClient.login(email, password);
      if (result.isOk()) {
        setUser(result.value.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

## この実装のメリット

1. **セキュリティの向上**:

   - HttpOnly Cookie によるトークン保存で XSS 攻撃からの保護
   - 二重送信クッキーパターンによる強力な CSRF 保護
   - SameSite 属性によるクロスサイトリクエスト制限

2. **開発体験の向上**:

   - axios による簡潔な API 通信
   - CSRF トークンの自動管理（インターセプターによる）
   - エラーハンドリングの改善

3. **保守性の向上**:

   - 明確な責任分離
   - モジュール化された設計
   - 標準的なライブラリの使用

4. **拡張性**:
   - 将来的な認証方法の追加が容易（OAuth、多要素認証など）
   - 異なる環境（開発/本番）での適切な設定

## 注意点

1. **環境変数の設定**:

   - `COOKIE_SECRET`: クッキーの署名に使用する秘密鍵
   - `CSRF_SECRET`: CSRF トークン生成に使用する秘密鍵
   - `JWT_SECRET`: JWT 署名に使用する秘密鍵
   - `JWT_EXPIRES_IN`: JWT の有効期限（秒）

2. **クロスドメイン設定**:

   - フロントエンドとバックエンドが異なるドメインの場合、CORS 設定が重要
   - 開発環境と本番環境で適切な設定が必要

3. **移行戦略**:
   - 既存のユーザーセッションを考慮した段階的な移行計画が必要

## 将来的な拡張

1. **多要素認証（2FA）の導入**:

   - TOTP（Time-based One-Time Password）の実装
   - SMS/メールによるワンタイムコード

2. **レート制限の実装**:

   - ログイン試行回数の制限
   - IP ベースのレート制限

3. **セッション管理の強化**:

   - アクティブセッションの一覧表示と管理
   - 不審なログインの検出と通知

4. **パスワードポリシーの強化**:
   - 強力なパスワード要件の設定
   - 定期的なパスワード変更の促進
   - パスワード漏洩チェック（Have I Been Pwned API との連携）
