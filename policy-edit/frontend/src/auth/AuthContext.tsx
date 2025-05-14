import type { Session, User } from "@auth/core";
import React, { createContext, useContext, useState, useEffect } from "react";
import type { AuthConfig } from "./auth-config";
import { authConfig } from "./auth-config";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  status: "loading",
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          if (data.session) {
            setSession(data.session);
            setUser(data.session.user);
            setStatus("authenticated");
          } else {
            setStatus("unauthenticated");
          }
        } else {
          setStatus("unauthenticated");
        }
      } catch (error) {
        console.error("Failed to check authentication status:", error);
        setStatus("unauthenticated");
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string) => {
    try {
      setStatus("loading");
      const response = await fetch("/api/auth/signin/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
      } else {
        setStatus("unauthenticated");
        throw new Error("Failed to sign in");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setStatus("unauthenticated");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setStatus("loading");
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      });

      if (response.ok) {
        setSession(null);
        setUser(null);
        setStatus("unauthenticated");
      } else {
        setStatus("authenticated");
        throw new Error("Failed to sign out");
      }
    } catch (error) {
      console.error("Sign out error:", error);
      setStatus("authenticated");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, status, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
