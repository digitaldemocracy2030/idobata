import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: "github" | "google") => Promise<void>;
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
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [BACKEND_URL]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/auth/signin`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "ログインに失敗しました");
      }

      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (err: any) {
      setError(err.message || "ログインに失敗しました");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "ユーザー登録に失敗しました");
      }

      return data;
    } catch (err: any) {
      setError(err.message || "ユーザー登録に失敗しました");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/auth/signout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "ログアウトに失敗しました");
      }

      setUser(null);
    } catch (err: any) {
      setError(err.message || "ログアウトに失敗しました");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithOAuth = async (provider: "github" | "google") => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/auth/oauth/${provider}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OAuth認証の開始に失敗しました");
      }

      if (data.success && data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || "OAuth認証の開始に失敗しました");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
