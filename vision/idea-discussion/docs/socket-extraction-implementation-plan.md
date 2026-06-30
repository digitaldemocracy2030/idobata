# 抽出通知のポーリングからソケット通信への移行計画

## 概要

現在、idobataの/legacy ページでは、チャットからの問題・解決策の抽出通知をフロントエンドがポーリングによって取得しています。この方法は効率が悪いため、WebSocketを使用したリアルタイム通知システムに移行する計画を提案します。この文書では、フロントエンドとバックエンドの疎結合を維持しながら、バックエンド側の実装手順について詳細に説明します。

## 現状の課題

現在のシステムでは、フロントエンドが定期的（5秒ごと）にバックエンドAPIを呼び出して新しい抽出結果を確認しています。この方法には以下の問題があります：

1. サーバーリソースの非効率な使用（変更がなくても定期的にAPIリクエストが発生）
2. 通知の遅延（最大5秒のラグが発生する可能性がある）
3. スケーラビリティの問題（ユーザー数が増えるとAPIリクエスト数が比例して増加）

## 目標

1. WebSocketを使用して、新しい抽出結果が生成された時点でリアルタイムに通知する
2. バックエンドとフロントエンドの疎結合を維持する
3. 既存のAPIエンドポイントは互換性のために維持する

## 実装手順

### 1. 依存関係の追加

```bash
cd idea-discussion/backend
npm install socket.io --save
```

### 2. WebSocketサーバーの設定

`idea-discussion/backend/server.js` に以下の変更を加えます：

```javascript
// 既存のExpressサーバー設定の後に追加
const http = require('http');
const { Server } = require('socket.io');

// HTTPサーバーの作成
const server = http.createServer(app);

// Socket.IOサーバーの初期化
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// WebSocketの接続ハンドラー
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // クライアントがテーマを購読
  socket.on('subscribe-theme', (themeId) => {
    if (themeId) {
      socket.join(`theme:${themeId}`);
      console.log(`Client ${socket.id} subscribed to theme:${themeId}`);
    }
  });
  
  // クライアントがテーマの購読を解除
  socket.on('unsubscribe-theme', (themeId) => {
    if (themeId) {
      socket.leave(`theme:${themeId}`);
      console.log(`Client ${socket.id} unsubscribed from theme:${themeId}`);
    }
  });
  
  // クライアントがスレッドを購読
  socket.on('subscribe-thread', (threadId) => {
    if (threadId) {
      socket.join(`thread:${threadId}`);
      console.log(`Client ${socket.id} subscribed to thread:${threadId}`);
    }
  });
  
  // クライアントがスレッドの購読を解除
  socket.on('unsubscribe-thread', (threadId) => {
    if (threadId) {
      socket.leave(`thread:${threadId}`);
      console.log(`Client ${socket.id} unsubscribed from thread:${threadId}`);
    }
  });
  
  // 切断イベント
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Expressのapp.listen()の代わりにserver.listen()を使用
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### 3. 抽出通知サービスの作成

新しいファイル `idea-discussion/backend/services/notification/extractionNotificationService.js` を作成します：

```javascript
/**
 * 抽出通知サービス
 * 抽出結果をWebSocketを通じてクライアントに通知する
 */
class ExtractionNotificationService {
  constructor(io) {
    this.io = io;
  }

  /**
   * 新しい問題抽出を通知
   * @param {Object} problem - 抽出された問題オブジェクト
   * @param {string} themeId - テーマID
   * @param {string} threadId - スレッドID
   */
  notifyNewProblem(problem, themeId, threadId) {
    // テーマに関連するすべてのクライアントに通知
    if (themeId) {
      this.io.to(`theme:${themeId}`).emit('new-extraction', {
        type: 'problem',
        data: problem
      });
    }
    
    // 特定のスレッドに関連するクライアントに通知
    if (threadId) {
      this.io.to(`thread:${threadId}`).emit('new-extraction', {
        type: 'problem',
        data: problem
      });
    }
  }

  /**
   * 新しい解決策抽出を通知
   * @param {Object} solution - 抽出された解決策オブジェクト
   * @param {string} themeId - テーマID
   * @param {string} threadId - スレッドID
   */
  notifySolution(solution, themeId, threadId) {
    // テーマに関連するすべてのクライアントに通知
    if (themeId) {
      this.io.to(`theme:${themeId}`).emit('new-extraction', {
        type: 'solution',
        data: solution
      });
    }
    
    // 特定のスレッドに関連するクライアントに通知
    if (threadId) {
      this.io.to(`thread:${threadId}`).emit('new-extraction', {
        type: 'solution',
        data: solution
      });
    }
  }

  /**
   * 抽出の更新を通知
   * @param {string} type - 'problem' または 'solution'
   * @param {Object} data - 更新されたデータ
   * @param {string} themeId - テーマID
   * @param {string} threadId - スレッドID
   */
  notifyExtractionUpdate(type, data, themeId, threadId) {
    // テーマに関連するすべてのクライアントに通知
    if (themeId) {
      this.io.to(`theme:${themeId}`).emit('extraction-update', {
        type,
        data
      });
    }
    
    // 特定のスレッドに関連するクライアントに通知
    if (threadId) {
      this.io.to(`thread:${threadId}`).emit('extraction-update', {
        type,
        data
      });
    }
  }
}

module.exports = ExtractionNotificationService;
```

### 4. サービスの初期化と依存性注入

`idea-discussion/backend/server.js` に以下を追加します：

```javascript
// 抽出通知サービスのインポート
const ExtractionNotificationService = require('./services/notification/extractionNotificationService');

// サービスのインスタンス化
const extractionNotificationService = new ExtractionNotificationService(io);

// アプリケーションコンテキストに追加（依存性注入）
app.set('extractionNotificationService', extractionNotificationService);
```

### 5. 抽出ワーカーの修正

`idea-discussion/backend/workers/extractionWorker.js` を修正して、抽出結果が生成されたときに通知サービスを呼び出すようにします：

```javascript
// 既存の保存関数を修正
async function saveExtractedItem(itemData, sourceOriginId, sourceType, sourceMetadata, themeId, req) {
  // 既存のコード...
  
  // 新しいアイテムが保存された場合
  if (newItem) {
    // 通知サービスの取得
    const extractionNotificationService = req.app.get('extractionNotificationService');
    
    // 通知サービスが利用可能な場合、通知を送信
    if (extractionNotificationService) {
      if (itemData.type === 'problem') {
        extractionNotificationService.notifyNewProblem(newItem, themeId, sourceOriginId);
      } else if (itemData.type === 'solution') {
        extractionNotificationService.notifySolution(newItem, themeId, sourceOriginId);
      }
    }
  }
  
  return newItem;
}

// 既存の更新関数を修正
async function updateExtractedItem(itemId, itemData, req) {
  // 既存のコード...
  
  // アイテムが更新された場合
  if (updatedItem) {
    // 通知サービスの取得
    const extractionNotificationService = req.app.get('extractionNotificationService');
    
    // 通知サービスが利用可能な場合、更新通知を送信
    if (extractionNotificationService) {
      extractionNotificationService.notifyExtractionUpdate(
        itemData.type,
        updatedItem,
        updatedItem.themeId,
        updatedItem.sourceOriginId
      );
    }
  }
  
  return updatedItem;
}
```

### 6. リクエストオブジェクトへのアクセス

抽出ワーカーはHTTPリクエストコンテキスト外で実行される可能性があるため、アプリケーションインスタンスへの参照を渡す必要があります：

```javascript
// extractionWorker.js の関数シグネチャを変更
async function processExtraction(chatThread, app) {
  // 既存のコード...
  
  // app からサービスを取得
  const extractionNotificationService = app.get('extractionNotificationService');
  
  // 以下のコードで req.app の代わりに app を使用
}

// chatController.js から呼び出す際に app を渡す
router.post('/themes/:themeId/chat/messages', async (req, res) => {
  // 既存のコード...
  
  // 非同期で抽出処理を開始
  processExtraction(chatThread, req.app).catch(err => {
    console.error('Error in extraction process:', err);
  });
  
  // レスポンスを返す
  // 既存のコード...
});
```

### 7. 環境変数の追加

`.env` ファイルに以下の変数を追加します：

```
# WebSocket設定
SOCKET_ENABLED=true
FRONTEND_URL=http://localhost:3000
```

### 8. 設定の条件分岐

`idea-discussion/backend/server.js` に条件分岐を追加して、環境変数に基づいてWebSocketを有効/無効にできるようにします：

```javascript
// WebSocketの条件付き初期化
let io;
if (process.env.SOCKET_ENABLED === 'true') {
  const server = http.createServer(app);
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  // WebSocketの接続ハンドラー
  io.on('connection', (socket) => {
    // 既存のコード...
  });
  
  // 抽出通知サービスの初期化
  const extractionNotificationService = new ExtractionNotificationService(io);
  app.set('extractionNotificationService', extractionNotificationService);
  
  // サーバーの起動
  server.listen(PORT, () => {
    console.log(`Server with WebSocket is running on port ${PORT}`);
  });
} else {
  // 従来のHTTPサーバーとして起動
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} (WebSocket disabled)`);
  });
}
```

### 9. ヘルスチェックエンドポイントの追加

WebSocketの状態を確認するためのエンドポイントを追加します：

```javascript
// idea-discussion/backend/routes/systemRoutes.js
const express = require('express');
const router = express.Router();

// WebSocketの状態を確認するエンドポイント
router.get('/socket-status', (req, res) => {
  const socketEnabled = process.env.SOCKET_ENABLED === 'true';
  const socketService = req.app.get('extractionNotificationService');
  
  res.json({
    socketEnabled,
    serviceAvailable: !!socketService,
    connectedClients: socketEnabled && socketService ? socketService.io.engine.clientsCount : 0
  });
});

module.exports = router;

// server.js にルーターを追加
const systemRoutes = require('./routes/systemRoutes');
app.use('/api/system', systemRoutes);
```

### 10. ロギングの強化

WebSocketイベントのロギングを強化します：

```javascript
// idea-discussion/backend/services/notification/extractionNotificationService.js に追加

/**
 * イベントをログに記録
 * @private
 * @param {string} event - イベント名
 * @param {Object} data - イベントデータ
 * @param {string} room - 送信先のルーム
 */
_logEvent(event, data, room) {
  console.log(`[WebSocket] Emitting '${event}' to ${room}:`, 
    JSON.stringify({
      type: data.type,
      id: data.data._id,
      timestamp: new Date().toISOString()
    })
  );
}

// 各通知メソッドでこのメソッドを呼び出す
notifyNewProblem(problem, themeId, threadId) {
  if (themeId) {
    const room = `theme:${themeId}`;
    this.io.to(room).emit('new-extraction', {
      type: 'problem',
      data: problem
    });
    this._logEvent('new-extraction', { type: 'problem', data: problem }, room);
  }
  
  // 同様に他のメソッドも修正
}
```

## テスト計画

### 1. ユニットテスト

`idea-discussion/backend/tests/services/notification/extractionNotificationService.test.js` を作成して、通知サービスをテストします：

```javascript
const { expect } = require('chai');
const sinon = require('sinon');
const ExtractionNotificationService = require('../../../services/notification/extractionNotificationService');

describe('ExtractionNotificationService', () => {
  let service;
  let mockIo;
  let mockSocket;
  
  beforeEach(() => {
    mockSocket = {
      emit: sinon.spy()
    };
    
    mockIo = {
      to: sinon.stub().returns(mockSocket)
    };
    
    service = new ExtractionNotificationService(mockIo);
  });
  
  it('should notify about new problem extraction', () => {
    const problem = { _id: 'problem1', statement: 'Test problem' };
    const themeId = 'theme1';
    const threadId = 'thread1';
    
    service.notifyNewProblem(problem, themeId, threadId);
    
    expect(mockIo.to.calledWith(`theme:${themeId}`)).to.be.true;
    expect(mockIo.to.calledWith(`thread:${threadId}`)).to.be.true;
    expect(mockSocket.emit.calledWith('new-extraction', {
      type: 'problem',
      data: problem
    })).to.be.true;
  });
  
  // 他のメソッドのテストも同様に実装
});
```

### 2. 統合テスト

`idea-discussion/backend/tests/integration/socket.test.js` を作成して、WebSocketの統合テストを実装します：

```javascript
const { expect } = require('chai');
const io = require('socket.io-client');
const { createServer } = require('http');
const { Server } = require('socket.io');
const express = require('express');
const ExtractionNotificationService = require('../../services/notification/extractionNotificationService');

describe('WebSocket Integration', () => {
  let clientSocket;
  let httpServer;
  let serverSocket;
  let service;
  let app;
  
  before((done) => {
    app = express();
    httpServer = createServer(app);
    const ioServer = new Server(httpServer);
    service = new ExtractionNotificationService(ioServer);
    app.set('extractionNotificationService', service);
    
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = io(`http://localhost:${port}`);
      
      ioServer.on('connection', (socket) => {
        serverSocket = socket;
        done();
      });
    });
  });
  
  after(() => {
    clientSocket.disconnect();
    httpServer.close();
  });
  
  it('should receive notification when subscribing to a theme', (done) => {
    const themeId = 'test-theme';
    const problem = { _id: 'test-problem', statement: 'Test problem' };
    
    clientSocket.emit('subscribe-theme', themeId);
    
    clientSocket.on('new-extraction', (data) => {
      expect(data.type).to.equal('problem');
      expect(data.data._id).to.equal(problem._id);
      done();
    });
    
    // サブスクリプションが処理されるのを待つ
    setTimeout(() => {
      service.notifyNewProblem(problem, themeId);
    }, 100);
  });
  
  // 他のテストケースも同様に実装
});
```

### 3. 手動テスト

1. WebSocketクライアントツール（例：[Socket.IO Tester](https://chrome.google.com/webstore/detail/socketio-tester/cgmimdpepcncnjgclhnhghdooepibakm)）を使用して接続テスト
2. 抽出処理をトリガーして通知が送信されることを確認
3. 複数クライアントでの同時接続テスト

## デプロイ計画

1. 開発環境での実装とテスト
2. ステージング環境へのデプロイと検証
3. 本番環境へのデプロイ（フロントエンド実装の準備ができた後）

## フロントエンド連携のためのAPI仕様書

フロントエンド開発者向けに、WebSocketイベントとペイロードの仕様を提供します：

### 接続

```javascript
// フロントエンド側の実装例
const socket = io('https://api.example.com', {
  withCredentials: true
});

// 接続イベント
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

// 切断イベント
socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});
```

### テーマの購読

```javascript
// テーマを購読
socket.emit('subscribe-theme', themeId);

// テーマの購読を解除
socket.emit('unsubscribe-theme', themeId);
```

### スレッドの購読

```javascript
// スレッドを購読
socket.emit('subscribe-thread', threadId);

// スレッドの購読を解除
socket.emit('unsubscribe-thread', threadId);
```

### 通知の受信

```javascript
// 新しい抽出結果の通知
socket.on('new-extraction', (data) => {
  const { type, data: extractedItem } = data;
  console.log(`New ${type} extracted:`, extractedItem);
  
  // UIの更新処理
});

// 抽出結果の更新通知
socket.on('extraction-update', (data) => {
  const { type, data: updatedItem } = data;
  console.log(`${type} updated:`, updatedItem);
  
  // UIの更新処理
});
```

## 注意事項

1. **バックワードコンパティビリティ**: 既存のポーリングAPIは当面維持し、フロントエンドの移行が完了するまで両方のシステムを並行して運用します。
2. **エラーハンドリング**: WebSocket接続が切断された場合、クライアントは自動的に再接続を試みるべきです。
3. **スケーラビリティ**: 将来的にはRedisアダプターを使用して複数のWebSocketサーバーインスタンス間で状態を共有することを検討します。
4. **セキュリティ**: 認証済みユーザーのみがWebSocketに接続できるように、認証メカニズムを実装することを検討します。

## まとめ

この実装計画に従うことで、idobataの抽出通知システムをポーリングからWebSocketベースのリアルタイム通知に移行できます。これにより、システムの効率性とユーザーエクスペリエンスが向上します。バックエンドとフロントエンドの疎結合を維持しながら、段階的に移行を進めることができます。
