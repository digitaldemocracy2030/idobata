# いどばたユーザー認証実装手順書

## 概要

いどばたアプリケーションに簡易的なユーザー認証機能を実装するための手順書です。この実装により、以下の機能が追加されます：

- ユーザーIDの自動生成と保存
- ユーザー表示名（displayName）の設定と保存
- 他のユーザーへの表示名の表示

## 実装要件

1. AuthProviderコンポーネントを作成し、全ページで利用できるようにする
2. ユーザーがアプリを初めて利用する際に、ランダムなユーザーID（UUID形式）を生成しlocalStorageに保存する
3. ユーザーIDは明示的にリセット不可とする
4. マイページからユーザーが自分の表示名（displayName）を設定できるようにする
5. 設定された表示名はバックエンドに保存され、他のユーザーにも表示可能にする

## 実装手順

### 1. 必要なパッケージのインストール

```bash
npm install uuid
npm install @types/uuid --save-dev
```

### 2. AuthContextの作成

`src/contexts/AuthContext.tsx`ファイルを作成し、以下の内容を実装します：

```tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { apiClient } from "../services/api/apiClient";

// ユーザー情報の型定義
interface User {
  id: string;
  displayName: string | null;
}

// AuthContextの型定義
interface AuthContextType {
  user: User;
  setDisplayName: (name: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

// デフォルト値を持つコンテキストを作成
const AuthContext = createContext<AuthContextType>({
  user: { id: "", displayName: null },
  setDisplayName: async () => false,
  loading: true,
  error: null,
});

// カスタムフックの作成
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>({ id: "", displayName: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ユーザーIDの取得または生成
  useEffect(() => {
    const initializeUser = async () => {
      // localStorageからユーザーIDを取得
      let userId = localStorage.getItem("idobataUserId");
      
      // ユーザーIDが存在しない場合は新規生成
      if (!userId) {
        userId = uuidv4();
        localStorage.setItem("idobataUserId", userId);
      }
      
      // バックエンドからユーザー情報を取得
      const result = await apiClient.getUserInfo(userId);
      
      if (result.isErr()) {
        console.error("Failed to fetch user info:", result.error);
        setUser({
          id: userId!,
          displayName: null,
        });
        setError("ユーザー情報の取得に失敗しました");
        setLoading(false);
        return;
      }
      
      const data = result.value;
      setUser({
        id: userId!,
        displayName: data.displayName,
      });
      setError(null);
      setLoading(false);
    };

    initializeUser();
  }, []);

  // 表示名を設定する関数
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

  return (
    <AuthContext.Provider value={{ user, setDisplayName, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. APIクライアントの拡張

`src/services/api/apiClient.ts`ファイルに以下のメソッドを追加します：

```typescript
// ユーザー情報を取得するメソッド
async getUserInfo(userId: string): Promise<HttpResult<{ displayName: string | null }>> {
  return this.withRetry(() =>
    this.httpClient.get<{ displayName: string | null }>(`/users/${userId}`)
  );
}

// ユーザーの表示名を更新するメソッド
async updateUserDisplayName(userId: string, displayName: string): Promise<HttpResult<void>> {
  return this.withRetry(() =>
    this.httpClient.put<void>(`/users/${userId}`, { displayName })
  );
}
```

### 4. Appコンポーネントの修正

`src/App.tsx`ファイルを修正して、AuthProviderを追加します：

```tsx
import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/AppLayout";
import PageLayout from "./components/layout/PageLayout";
import About from "./pages/About";
import DataPage from "./pages/DataPage";
import MainPage from "./pages/MainPage";
import QuestionDetail from "./pages/QuestionDetail";
import ThemeDetail from "./pages/ThemeDetail";
import Themes from "./pages/Themes";
import Top from "./pages/Top";
import MyPage from "./pages/MyPage";

function App() {
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    ),
    children: [
      { index: true, element: <Navigate to="/top" replace /> },
      {
        path: "legacy",
        element: <AppLayout />,
        children: [
          { index: true, element: <MainPage /> },
          { path: "data", element: <DataPage /> },
          { path: "*", element: <Navigate to="/old" replace /> },
        ],
      },
      {
        path: "top",
        element: (
          <PageLayout>
            <Top />
          </PageLayout>
        ),
      },
      {
        path: "about",
        element: (
          <PageLayout>
            <About />
          </PageLayout>
        ),
      },
      {
        path: "themes",
        element: (
          <PageLayout>
            <Themes />
          </PageLayout>
        ),
      },
      {
        path: "themes/:themeId",
        element: (
          <PageLayout>
            <ThemeDetail />
          </PageLayout>
        ),
      },
      {
        path: "themes/:themeId/questions/:qId",
        element: (
          <PageLayout>
            <QuestionDetail />
          </PageLayout>
        ),
      },
      {
        path: "mypage",
        element: (
          <PageLayout>
            <MyPage />
          </PageLayout>
        ),
      },
    ],
  },
]);

export default App;
```

### 5. マイページコンポーネントの作成

`src/pages/MyPage.tsx`ファイルを作成し、以下の内容を実装します：

```tsx
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
          <p className="text-sm text-gray-500 mt-1">※ユーザーIDはリセットできません</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="displayName" className="block text-gray-600 mb-2">
              表示名:
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
```

### 6. ヘッダーにマイページへのリンクを追加

`src/components/layout/Header.tsx`ファイルを修正して、マイページへのリンクを追加します：

```tsx
// 既存のインポートに加えて
import { useAuth } from "../../contexts/AuthContext";

// コンポーネント内で
const Header: React.FC = () => {
  const { user } = useAuth();
  
  // 既存のコード...
  
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 既存のナビゲーション */}
          
          {/* マイページへのリンクを追加 */}
          <div className="flex items-center">
            <Link
              to="/mypage"
              className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              {user.displayName ? user.displayName : "マイページ"}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
```

### 7. バックエンドAPIの実装

バックエンドに以下のAPIエンドポイントを実装します：

#### ユーザー情報取得API

```javascript
// controllers/userController.js
const User = require('../models/User');

// ユーザー情報を取得
exports.getUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // ユーザーをデータベースから検索
    let user = await User.findOne({ userId });
    
    // ユーザーが存在しない場合は新規作成
    if (!user) {
      user = new User({
        userId,
        displayName: null,
        createdAt: new Date(),
      });
      await user.save();
    }
    
    res.status(200).json({
      displayName: user.displayName,
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ message: 'ユーザー情報の取得に失敗しました' });
  }
};

// ユーザーの表示名を更新
exports.updateUserDisplayName = async (req, res) => {
  try {
    const { userId } = req.params;
    const { displayName } = req.body;
    
    if (!displayName) {
      return res.status(400).json({ message: '表示名は必須です' });
    }
    
    // ユーザーをデータベースから検索し、なければ作成
    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({
        userId,
        displayName,
        createdAt: new Date(),
      });
    } else {
      user.displayName = displayName;
      user.updatedAt = new Date();
    }
    
    await user.save();
    
    res.status(200).json({ message: '表示名を更新しました' });
  } catch (error) {
    console.error('Error updating display name:', error);
    res.status(500).json({ message: '表示名の更新に失敗しました' });
  }
};
```

#### ユーザーモデルの作成

```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
```

#### ルーティングの設定

```javascript
// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// ユーザー情報取得
router.get('/:userId', userController.getUserInfo);

// ユーザー表示名更新
router.put('/:userId', userController.updateUserDisplayName);

module.exports = router;
```

```javascript
// server.js または app.js
const userRoutes = require('./routes/userRoutes');

// 他のルーティング設定の後に追加
app.use('/api/users', userRoutes);
```

### 8. チャットコンポーネントの修正

チャットメッセージにユーザー名を表示するために、チャットコンポーネントを修正します：

```tsx
// src/components/chat/ChatMessage.tsx
import React from "react";
import { useAuth } from "../../contexts/AuthContext";

interface ChatMessageProps {
  message: {
    content: string;
    sender: string;
    userId: string;
    timestamp: string;
    displayName?: string;
  };
  isUser: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser }) => {
  const { user } = useAuth();
  
  // 表示名の決定
  const displayName = isUser 
    ? (user.displayName || "あなた") 
    : (message.displayName || "ユーザー");
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
          isUser ? "bg-blue-100" : "bg-gray-100"
        }`}
      >
        <div className="text-xs text-gray-500 mb-1">
          {displayName} - {new Date(message.timestamp).toLocaleString()}
        </div>
        <div>{message.content}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
```

## 実装の注意点

1. **ユーザーIDの生成**
   - UUIDを使用して一意のIDを生成します
   - 一度生成されたIDはリセットできないようにします

2. **表示名の保存**
   - バックエンドにユーザーIDと紐づけて表示名を保存します
   - 表示名が設定されていない場合は、デフォルト値（「ユーザー」など）を表示します

3. **認証の範囲**
   - この実装は簡易的なユーザー識別機能であり、本格的な認証（パスワード認証など）は含みません
   - 将来的に本格的な認証が必要になった場合は、この実装を拡張することができます

4. **エラーハンドリング**
   - ネットワークエラーや認証エラーを適切に処理し、ユーザーに通知します
   - オフライン時にも基本的な機能が動作するようにします

## テスト手順

1. **ユーザーID生成のテスト**
   - アプリケーションを初めて開いたときに、localStorageにユーザーIDが保存されることを確認
   - ブラウザのDevToolsを使用してlocalStorageを確認

2. **表示名設定のテスト**
   - マイページで表示名を設定し、保存できることを確認
   - 設定した表示名がヘッダーに表示されることを確認

3. **チャット機能のテスト**
   - チャットメッセージを送信し、自分の表示名が正しく表示されることを確認
   - 他のユーザーのメッセージにも表示名が表示されることを確認

## 今後の拡張可能性

1. **プロフィール画像の追加**
   - ユーザーがプロフィール画像をアップロードできるようにする

2. **ソーシャルログインの統合**
   - Google、Twitter、GitHubなどのソーシャルログインを追加する

3. **ユーザー権限の管理**
   - 管理者権限や特定の機能へのアクセス制限を追加する

4. **通知設定**
   - ユーザーごとに通知設定を保存し、カスタマイズ可能にする
