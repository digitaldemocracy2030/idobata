import React, { createContext, useContext, useState, useEffect } from "react";
import { betterAuth } from "./auth";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const session = await betterAuth.getSession();
        
        if (session) {
          setUser(session.user as User);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        setError("認証チェックに失敗しました");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await betterAuth.signIn({
        email,
        password,
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setUser(result.user as User);
    } catch (err) {
      console.error("Sign in failed:", err);
      setError("ログインに失敗しました。メールアドレスとパスワードを確認してください。");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await betterAuth.signUp({
        email,
        password,
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.user) {
        setUser(result.user as User);
      }
    } catch (err) {
      console.error("Sign up failed:", err);
      setError("アカウント登録に失敗しました。別のメールアドレスを試してください。");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await betterAuth.signOut();
      setUser(null);
    } catch (err) {
      console.error("Sign out failed:", err);
      setError("ログアウトに失敗しました");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
