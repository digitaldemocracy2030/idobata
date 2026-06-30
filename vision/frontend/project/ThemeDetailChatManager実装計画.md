# ThemeDetailChatManager 実装計画

## 概要

`ThemeDetailChatManager`クラスは、テーマ詳細ページでのチャットセッション全体を管理するためのクラスです。このクラスは以下の機能を提供します：

1. 初期化時にテーマ名をSystemNotificationで表示
2. ユーザーとシステムのメッセージの管理
3. チャットで投稿が行われた際にextraction WebSocketを購読
4. extraction完了通知を受け取った際にSystemNotificationでその旨を表示

## 実装手順

### 1. WebSocketクライアントモジュールの作成

まず、WebSocketクライアントを実装するためのモジュールを作成します。

```typescript
// frontend/src/services/websocket/extractionWebSocketClient.ts

import { io, Socket } from "socket.io-client";

export interface ExtractionNotification {
  type: 'problem' | 'solution';
  data: {
    _id: string;
    statement: string;
    [key: string]: any;
  };
}

export class ExtractionWebSocketClient {
  private socket: Socket | null = null;
  private apiUrl: string;

  constructor(apiUrl: string = process.env.VITE_API_URL || 'http://localhost:3001') {
    this.apiUrl = apiUrl;
  }

  connect(): void {
    if (this.socket) {
      return;
    }

    this.socket = io(this.apiUrl, {
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToTheme(themeId: string): void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.emit('subscribe-theme', themeId);
  }

  unsubscribeFromTheme(themeId: string): void {
    this.socket?.emit('unsubscribe-theme', themeId);
  }

  subscribeToThread(threadId: string): void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.emit('subscribe-thread', threadId);
  }

  unsubscribeFromThread(threadId: string): void {
    this.socket?.emit('unsubscribe-thread', threadId);
  }

  onNewExtraction(callback: (data: ExtractionNotification) => void): void {
    this.socket?.on('new-extraction', callback);
  }

  onExtractionUpdate(callback: (data: ExtractionNotification) => void): void {
    this.socket?.on('extraction-update', callback);
  }

  removeAllListeners(): void {
    this.socket?.removeAllListeners('new-extraction');
    this.socket?.removeAllListeners('extraction-update');
  }
}
```

### 2. ThemeDetailChatManagerクラスの実装

次に、`ThemeDetailChatManager`クラスを実装します。

```typescript
// frontend/src/pages/ThemeDetailChatManager.ts

import { ExtractionWebSocketClient, ExtractionNotification } from "../services/websocket/extractionWebSocketClient";
import { SystemNotification, Message, MessageType } from "../types";

export interface ThemeDetailChatManagerOptions {
  themeId: string;
  themeName: string;
  onNewMessage?: (message: Message) => void;
  onNewExtraction?: (extraction: ExtractionNotification) => void;
}

export class ThemeDetailChatManager {
  private themeId: string;
  private themeName: string;
  private messages: Message[] = [];
  private webSocketClient: ExtractionWebSocketClient;
  private onNewMessage?: (message: Message) => void;
  private onNewExtraction?: (extraction: ExtractionNotification) => void;
  private threadId?: string;

  constructor(options: ThemeDetailChatManagerOptions) {
    this.themeId = options.themeId;
    this.themeName = options.themeName;
    this.onNewMessage = options.onNewMessage;
    this.onNewExtraction = options.onNewExtraction;
    this.webSocketClient = new ExtractionWebSocketClient();

    // 初期化時にテーマ名を表示
    this.showThemeNotification();
  }

  private showThemeNotification(): void {
    const notification = new SystemNotification(
      `「${this.themeName}」がチャット対象になりました。`
    );
    this.messages.push(notification);
    this.onNewMessage?.(notification);
  }

  // メッセージの追加
  addMessage(content: string, type: MessageType): void {
    let newMessage: Message;

    switch (type) {
      case "user":
        // ユーザーメッセージが追加されたら、抽出WebSocketを購読
        this.subscribeToExtraction();
        newMessage = new UserMessage(content);
        break;
      case "system":
        newMessage = new SystemMessage(content);
        break;
      case "system-message":
        newMessage = new SystemNotification(content);
        break;
      default:
        newMessage = new SystemMessage(content);
    }

    this.messages.push(newMessage);
    this.onNewMessage?.(newMessage);
  }

  // WebSocketの購読開始
  private subscribeToExtraction(): void {
    this.webSocketClient.connect();
    this.webSocketClient.subscribeToTheme(this.themeId);
    
    if (this.threadId) {
      this.webSocketClient.subscribeToThread(this.threadId);
    }

    // 抽出通知のリスナーを設定
    this.webSocketClient.onNewExtraction(this.handleNewExtraction.bind(this));
    this.webSocketClient.onExtractionUpdate(this.handleExtractionUpdate.bind(this));
  }

  // 新しい抽出結果の処理
  private handleNewExtraction(data: ExtractionNotification): void {
    const { type, data: extractedItem } = data;
    
    // 抽出完了通知を表示
    const notificationContent = type === 'problem' 
      ? `新しい問題「${extractedItem.statement}」が抽出されました。`
      : `新しい解決策「${extractedItem.statement}」が抽出されました。`;
    
    const notification = new SystemNotification(notificationContent);
    this.messages.push(notification);
    this.onNewMessage?.(notification);
    
    // 抽出イベントのコールバックを呼び出し
    this.onNewExtraction?.(data);
  }

  // 抽出結果の更新処理
  private handleExtractionUpdate(data: ExtractionNotification): void {
    // 必要に応じて更新通知を表示
    this.onNewExtraction?.(data);
  }

  // スレッドIDの設定（チャットスレッドが作成された場合）
  setThreadId(threadId: string): void {
    this.threadId = threadId;
    
    // すでに接続している場合は、新しいスレッドを購読
    if (this.webSocketClient) {
      this.webSocketClient.subscribeToThread(threadId);
    }
  }

  // クリーンアップ
  cleanup(): void {
    if (this.webSocketClient) {
      this.webSocketClient.removeAllListeners();
      this.webSocketClient.unsubscribeFromTheme(this.themeId);
      
      if (this.threadId) {
        this.webSocketClient.unsubscribeFromThread(this.threadId);
      }
      
      this.webSocketClient.disconnect();
    }
  }

  // すべてのメッセージを取得
  getMessages(): Message[] {
    return [...this.messages];
  }

  // メッセージをクリア
  clearMessages(): void {
    this.messages = [];
  }
}
```

### 3. ThemeDetail.tsxの修正

最後に、`ThemeDetail.tsx`を修正して`ThemeDetailChatManager`を統合します。

```typescript
// frontend/src/pages/ThemeDetail.tsx（修正版）

import { useLocation, useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import ThemeDetailTemplate from "../components/theme/ThemeDetailTemplate";
import { useThemeDetail } from "../hooks/useThemeDetail";
import { ThemeDetailChatManager } from "./ThemeDetailChatManager";
import { FloatingChat, FloatingChatRef } from "../components/chat/FloatingChat";
import { Message } from "../types";

const ThemeDetail = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const location = useLocation();
  const useMockData = location.search.includes("mock=true");
  const chatRef = useRef<FloatingChatRef>(null);
  const chatManagerRef = useRef<ThemeDetailChatManager | null>(null);

  const {
    themeDetail: apiThemeDetail,
    isLoading: apiIsLoading,
    error: apiError,
  } = useThemeDetail(themeId || "");

  // モックデータを使用する場合は、APIデータの代わりにモックデータを使用
  const themeDetail = useMockData ? null : apiThemeDetail;
  const isLoading = useMockData ? false : apiIsLoading;
  const error = useMockData ? null : apiError;

  // チャットマネージャーの初期化
  useEffect(() => {
    if (themeDetail?.theme && themeId) {
      // チャットマネージャーを初期化
      chatManagerRef.current = new ThemeDetailChatManager({
        themeId,
        themeName: themeDetail.theme.title,
        onNewMessage: handleNewMessage,
        onNewExtraction: handleNewExtraction,
      });

      // コンポーネントのアンマウント時にクリーンアップ
      return () => {
        chatManagerRef.current?.cleanup();
        chatManagerRef.current = null;
      };
    }
  }, [themeDetail?.theme, themeId]);

  // 新しいメッセージの処理
  const handleNewMessage = (message: Message) => {
    if (chatRef.current) {
      chatRef.current.addMessage(message.content, "system-message");
    }
  };

  // 新しい抽出結果の処理
  const handleNewExtraction = (extraction: any) => {
    console.log("New extraction:", extraction);
    // 必要に応じて追加の処理を実装
  };

  // ユーザーがメッセージを送信した時の処理
  const handleSendMessage = (message: string) => {
    if (chatManagerRef.current) {
      chatManagerRef.current.addMessage(message, "user");
    }
  };

  // モックデータ
  const mockThemeData = {
    // 既存のモックデータ
  };

  // 以下、既存のコード（モックデータ、ローディング状態、エラー状態など）

  // テンプレートのレンダリング
  if (useMockData || themeDetail) {
    // テンプレートのpropsにデータをマッピング
    const templateProps = useMockData
      ? {
          // 既存のモックデータマッピング
        }
      : {
          // 既存のAPIデータマッピング
        };

    return (
      <>
        <ThemeDetailTemplate {...templateProps} />
        <FloatingChat
          ref={chatRef}
          onSendMessage={handleSendMessage}
        />
      </>
    );
  }

  // 予期しない状態の場合のフォールバック
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-8">
        <p>テーマの詳細を表示できません。</p>
      </div>
    </div>
  );
};

export default ThemeDetail;
```

## 依存関係

この実装には以下の依存関係が必要です：

1. socket.io-client: WebSocketクライアント用ライブラリ
   ```bash
   npm install socket.io-client
   ```

## テスト計画

1. テーマ詳細ページの読み込み時にテーマ名の通知が表示されることを確認
2. ユーザーがメッセージを送信した際にWebSocket接続が確立されることを確認
3. バックエンドから抽出通知が送信された際に、適切な通知が表示されることを確認
4. ページ離脱時にWebSocket接続が適切に切断されることを確認

## 注意事項

1. 環境変数`VITE_API_URL`が設定されていない場合は、デフォルトで`http://localhost:3001`に接続します。
2. WebSocketサーバーが利用できない場合のフォールバック処理は今回の実装には含まれていません。必要に応じて追加してください。
3. 認証が必要な場合は、WebSocketクライアントの接続オプションに認証情報を追加する必要があります。
