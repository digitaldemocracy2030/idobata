import React, { useEffect, useState } from "react";
import BreadcrumbView from "../components/common/BreadcrumbView";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";

const MyPage: React.FC = () => {
  const { user, setDisplayName, setProfileImagePath, loading, error } =
    useAuth();
  const [newDisplayName, setNewDisplayName] = useState(user.displayName || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNewDisplayName(user.displayName || "");
  }, [user.displayName]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarSaveSuccess, setAvatarSaveSuccess] = useState(false);

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

  const avatars = Array.from({ length: 6 }, (_, i) => `/images/avatars/avatar${i + 1}.png`);

  const handleSelectAvatar = (path: string) => {
    setSaveError(null);
    const ok = setProfileImagePath(path);
    setAvatarSaveSuccess(ok);
    if (!ok) {
      setSaveError("プロフィール画像の保存に失敗しました。もう一度お試しください。");
    }
  };

  if (loading) {
    return <div className="p-4">読み込み中...</div>;
  }

  const breadcrumbItems = [{ label: "マイページ", href: "/mypage" }];

  return (
    <div className="container mx-auto px-6 py-2 max-w-4xl">
      <BreadcrumbView items={breadcrumbItems} />

      <div className="pt-4 mb-4">
        <h1 className="text-4xl font-bold mb-4">マイページ</h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          本サイト内での表示名と画像を変更できます。アカウントはお使いの端末ごとに自動生成され、メールアドレスや個人情報の入力は不要でお手軽にご利用いただけます。
        </p>

        <div className="flex flex-col gap-8 text-base">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="displayName"
                className="text-gray-600 mb-4 flex items-center gap-2"
              >
                <span className="text-base">お名前</span>
                <span className="text-xs text-gray-500">
                  ※サイト内で表示されるので本名は控えてください
                </span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  id="displayName"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="max-w-[240px] border rounded p-2 h-10"
                  placeholder="表示名を入力してください"
                  required
                />
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-10 px-5 rounded-lg border-blue-600 bg-white hover:bg-blue-50 hover:text-blue-600 text-blue-600 text-xs font-bold tracking-[0.025em] whitespace-nowrap"
                  variant="outline"
                >
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
        </div>
      </div>

      {/* プロフィール画像セクション */}
      <div className="mb-16">
        <p className="text-gray-600 mb-4">プロフィール画像</p>
        <div className="flex flex-col items-start gap-3">
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
          <div className="text-sm text-gray-600">以下から画像を選択してください</div>
          <div className="grid grid-cols-3 gap-3">
            {avatars.map((src) => {
              const selected = user.profileImageUrl === src;
              return (
                <button
                  type="button"
                  key={src}
                  onClick={() => handleSelectAvatar(src)}
                  className={`w-20 h-20 rounded-full overflow-hidden border transition ring-offset-2 focus:outline-none ${
                    selected ? "ring-2 ring-blue-500" : "hover:ring-2 hover:ring-gray-300"
                  }`}
                  aria-label={`アバター ${src}`}
                >
                  <img src={src} alt="アバター" className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>
          {avatarSaveSuccess && (
            <div className="bg-green-100 text-green-700 p-2 rounded">保存されました</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
