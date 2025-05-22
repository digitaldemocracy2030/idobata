import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { apiClient } from "../services/api/apiClient";

interface User {
  id: string;
  displayName: string | null;
  profileImageUrl: string | null;
}

interface AuthContextType {
  user: User;
  setDisplayName: (name: string) => Promise<boolean>;
  uploadProfileImage: (file: File) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: { id: "", displayName: null, profileImageUrl: null },
  setDisplayName: async () => false,
  uploadProfileImage: async () => false,
  loading: true,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>({
    id: "",
    displayName: null,
    profileImageUrl: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      let userId = localStorage.getItem("idobataUserId");

      if (!userId) {
        userId = uuidv4();
        localStorage.setItem("idobataUserId", userId);
      }

      const result = await apiClient.getUserInfo(userId);

      if (result.isErr()) {
        console.error("Failed to fetch user info:", result.error);
        setUser({
          id: userId,
          displayName: null,
          profileImageUrl: null,
        });
        setError("ユーザー情報の取得に失敗しました");
        setLoading(false);
        return;
      }

      const data = result.value;
      setUser({
        id: userId,
        displayName: data.displayName,
        profileImageUrl: data.profileImagePath,
      });
      setError(null);
      setLoading(false);
    };

    initializeUser();
  }, []);

  const setDisplayName = async (name: string): Promise<boolean> => {
    const result = await apiClient.updateUserDisplayName(user.id, name);

    if (result.isErr()) {
      console.error("Failed to update display name:", result.error);
      const errorMessage =
        typeof result.error.data === "object" &&
        result.error.data !== null &&
        "error" in result.error.data
          ? String(result.error.data.error)
          : "表示名の更新に失敗しました";
      setError(errorMessage);
      return false;
    }

    setUser({ ...user, displayName: name });
    return true;
  };

  const uploadProfileImage = async (file: File): Promise<boolean> => {
    const result = await apiClient.uploadProfileImage(user.id, file);

    if (result.isErr()) {
      console.error("Failed to upload profile image:", result.error);
      const errorMessage =
        typeof result.error.data === "object" &&
        result.error.data !== null &&
        "error" in result.error.data
          ? String(result.error.data.error)
          : "プロフィール画像のアップロードに失敗しました";
      setError(errorMessage);
      return false;
    }

    setUser({ ...user, profileImageUrl: result.value.profileImageUrl });
    return true;
  };

  return (
    <AuthContext.Provider
      value={{ user, setDisplayName, uploadProfileImage, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};
