import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "../services/api/apiClient";
import { userIdManager } from "../utils/userIdManager";

interface User {
  id: string;
  displayName: string | null;
  profileImageUrl: string | null;
}

interface AuthContextType {
  user: User;
  setDisplayName: (name: string) => Promise<boolean>;
  uploadProfileImage: (file: File) => Promise<boolean>;
  setProfileImagePath: (path: string) => boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: { id: "", displayName: null, profileImageUrl: null },
  setDisplayName: async () => false,
  uploadProfileImage: async () => false,
  setProfileImagePath: () => false,
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
      const userId = userIdManager.getUserId();

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

      // Prefer locally selected avatar if present
      const localAvatarPath = localStorage.getItem("idobataProfileImagePath");

      setUser({
        id: userId,
        displayName: data.displayName,
        profileImageUrl: localAvatarPath || data.profileImagePath,
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
      setError("表示名の更新に失敗しました");
      return false;
    }

    setUser({ ...user, displayName: name });
    return true;
  };

  const uploadProfileImage = async (file: File): Promise<boolean> => {
    const result = await apiClient.uploadProfileImage(user.id, file);

    if (result.isErr()) {
      console.error("Failed to upload profile image:", result.error);
      setError("プロフィール画像のアップロードに失敗しました");
      return false;
    }

    setUser({ ...user, profileImageUrl: result.value.profileImageUrl });
    return true;
  };

  const setProfileImagePath = (path: string): boolean => {
    try {
      localStorage.setItem("idobataProfileImagePath", path);
      setUser((prev) => ({ ...prev, profileImageUrl: path }));
      setError(null);
      return true;
    } catch (e) {
      console.error("Failed to set profile image path:", e);
      setError("プロフィール画像の保存に失敗しました");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setDisplayName, uploadProfileImage, setProfileImagePath, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};
