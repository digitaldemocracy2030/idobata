import React, { useRef, useState } from "react";
import SectionHeading from "../components/common/SectionHeading";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";

const MyPage: React.FC = () => {
  const { user, setDisplayName, uploadProfileImage, loading, error } =
    useAuth();
  const { addNotification } = useNotification();
  const [newDisplayName, setNewDisplayName] = useState(user.displayName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const success = await setDisplayName(newDisplayName);
    if (success) {
      setSaveSuccess(true);
      addNotification("表示名が保存されました");
    } else {
      setSaveError("表示名の保存に失敗しました。もう一度お試しください。");
      addNotification(`エラー: ${error || "表示名の保存に失敗しました"}`);
    }

    setIsSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setIsUploading(true);
    setSaveError(null);

    const success = await uploadProfileImage(file);
    if (!success) {
      setSaveError(
        "画像のアップロードに失敗しました。もう一度お試しください。"
      );
      addNotification(`エラー: ${error || "画像のアップロードに失敗しました"}`);
    } else {
      addNotification("プロフィール画像がアップロードされました");
    }

    setIsUploading(false);
  };

  if (loading) {
    return <div className="p-4">読み込み中...</div>;
  }

  return (
    <div className="mx-auto p-4 xl:max-w-none">
      <SectionHeading title="マイページ" />

      <div className="flex flex-col gap-8 text-base">
        {/* プロフィール画像セクション */}
        <div className="">
          <p className="text-gray-600 mb-2">プロフィール画像:</p>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden border">
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="プロフィール"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12"
                    role="img"
                    aria-label="ユーザーアイコン"
                  >
                    <title>ユーザーアイコン</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
                onChange={handleImageUpload}
                ref={fileInputRef}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? "アップロード中..." : "画像を変更"}
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="displayName" className="block text-gray-600 mb-2">
              表示名（他のユーザーに表示されます）:
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                id="displayName"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="表示名を入力してください"
                required
              />
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>
          {saveSuccess && (
            <div className="bg-green-100 text-green-700 p-2 rounded mb-4">
              保存されました
            </div>
          )}

          {saveError && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
              {saveError}
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
              {error}
            </div>
          )}
        </form>
        <div className="mb-4">
          <p className="text-gray-600">ユーザーID（デバッグ用）:</p>
          <p className="font-mono bg-gray-100 p-2 rounded">{user.id}</p>
          <p className="text-sm text-gray-500 mt-1">
            ※ユーザーIDはリセットできません
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
