import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const MyPage: React.FC = () => {
  const { user, setDisplayName, loading, error } = useAuth();
  const [newDisplayName, setNewDisplayName] = useState(user.displayName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const success = await setDisplayName(newDisplayName);
    if (success) {
      setSaveSuccess(true);
    } else {
      setSaveError("表示名の保存に失敗しました。もう一度お試しください。");
    }

    setIsSaving(false);
  };

  if (loading) {
    return <div className="p-4">読み込み中...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">マイページ</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">ユーザー情報</h2>
        <div className="mb-4">
          <p className="text-gray-600">ユーザーID:</p>
          <p className="font-mono bg-gray-100 p-2 rounded">{user.id}</p>
          <p className="text-sm text-gray-500 mt-1">
            ※ユーザーIDはリセットできません
          </p>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600">現在の表示名:</p>
          {user.displayName ? (
            <p className="font-semibold bg-blue-50 p-2 rounded border border-blue-100">
              {user.displayName}
            </p>
          ) : (
            <p className="italic text-gray-500 p-2">
              表示名が設定されていません
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="displayName" className="block text-gray-600 mb-2">
              表示名を{user.displayName ? "変更" : "設定"}:
            </label>
            <input
              type="text"
              id="displayName"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="表示名を入力してください"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              ※表示名は他のユーザーに表示されます
            </p>
          </div>
          {saveSuccess && (
            <div className="bg-green-100 text-green-700 p-2 rounded mb-4">
              表示名を保存しました！
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

          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
          >
            {isSaving ? "保存中..." : "保存"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MyPage;
