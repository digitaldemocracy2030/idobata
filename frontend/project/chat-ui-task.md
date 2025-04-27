# 画面下部に固定できるチャットコンポーネント実装手順

## 概要

このタスクでは、3つのページ（About.tsx、Themes.tsx、ThemeDetail.tsx）で共通して使用できる、画面下部に固定されたフローティングチャットコンポーネントを実装します。

## 仕様

- 初期状態では画面下部にfloatingで存在している
- クリックすると上方向に広がって会話ウィンドウが見えるようになる
- 上方向に伸びた状態ではハーフモーダル状態になって、上方向をドラッグすることで高さを操作できる
- メッセージは3種類、ユーザー（右）とシステム発話（左）とシステムメッセージ（中央）
- システムの発話はstreamで受け取ることができる
- 上記のような抽象的な機能のみ持ち、イベントを登録して汎用的に使うことができる

## 実装手順

1. **プロジェクト準備**
   1. 必要なライブラリがインストールされていることを確認（@radix-ui/react-dialog, lucide-react など）
   2. 既存のコンポーネントの構造を理解

2. **基本構造の作成**
   1. 新しいディレクトリ `frontend/src/components/chat` を作成
   2. 基本コンポーネントファイルを作成（FloatingChat.tsx, ChatSheet.tsx など）
   3. types.ts に新しい型定義を追加
      ```typescript
      // frontend/src/types.ts に追加
      export type MessageType = 'user' | 'system' | 'system-message';

      export interface ExtendedMessage extends Message {
        type: MessageType;
        isStreaming?: boolean;
        id?: string;
      }
      ```

3. **ChatProvider の実装**
   1. ChatProvider.tsx を作成
      ```typescript
      // frontend/src/components/chat/ChatProvider.tsx
      import React, { createContext, useContext, useState, useCallback } from 'react';
      import { ExtendedMessage, MessageType } from '../../types';

      interface ChatContextType {
        messages: ExtendedMessage[];
        addMessage: (content: string, type: MessageType) => void;
        startStreamingMessage: (content: string, type: MessageType) => string;
        updateStreamingMessage: (id: string, content: string) => void;
        endStreamingMessage: (id: string) => void;
        clearMessages: () => void;
      }

      const ChatContext = createContext<ChatContextType | undefined>(undefined);

      export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const [messages, setMessages] = useState<ExtendedMessage[]>([]);

        // 新しいメッセージを追加
        const addMessage = useCallback((content: string, type: MessageType) => {
          const newMessage: ExtendedMessage = {
            role: type === 'user' ? 'user' : 'assistant',
            content,
            type,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, newMessage]);
        }, []);

        // ストリーミングメッセージを開始
        const startStreamingMessage = useCallback((content: string, type: MessageType) => {
          const id = Date.now().toString();
          const newMessage: ExtendedMessage = {
            role: type === 'user' ? 'user' : 'assistant',
            content,
            type,
            timestamp: new Date(),
            isStreaming: true,
            id,
          };

          setMessages(prev => [...prev, newMessage]);
          return id;
        }, []);

        // ストリーミングメッセージを更新
        const updateStreamingMessage = useCallback((id: string, content: string) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === id ? { ...msg, content } : msg
            )
          );
        }, []);

        // ストリーミングを終了
        const endStreamingMessage = useCallback((id: string) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === id ? { ...msg, isStreaming: false } : msg
            )
          );
        }, []);

        // メッセージをクリア
        const clearMessages = useCallback(() => {
          setMessages([]);
        }, []);

        const value = {
          messages,
          addMessage,
          startStreamingMessage,
          updateStreamingMessage,
          endStreamingMessage,
          clearMessages,
        };

        return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
      };

      export const useChat = () => {
        const context = useContext(ChatContext);
        if (context === undefined) {
          throw new Error('useChat must be used within a ChatProvider');
        }
        return context;
      };
      ```
   2. メッセージ状態管理ロジックを実装
   3. ストリーミングメッセージのサポートを追加

4. **FloatingChatButton の実装**
   1. 画面下部に固定されるボタンコンポーネントを作成
      ```typescript
      // frontend/src/components/chat/FloatingChatButton.tsx
      import React from 'react';
      import { Button } from '../ui/button';
      import { MessageSquare } from 'lucide-react';
      import { cn } from '../../lib/utils';

      interface FloatingChatButtonProps {
        onClick: () => void;
        hasUnread?: boolean;
      }

      export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
        onClick,
        hasUnread = false,
      }) => {
        return (
          <div className="fixed bottom-4 right-4 z-50">
            <Button
              onClick={onClick}
              className={cn(
                'rounded-full w-14 h-14 shadow-lg flex items-center justify-center',
                hasUnread && 'animate-pulse'
              )}
            >
              <MessageSquare className="h-6 w-6" />
              {hasUnread && (
                <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500"></span>
              )}
            </Button>
          </div>
        );
      };
      ```
   2. アニメーションとスタイリングを追加

5. **ドラッグ機能の実装**
   1. useDraggable フックを作成
      ```typescript
      // frontend/src/hooks/useDraggable.ts
      import { useState, useEffect, useCallback } from 'react';

      interface DraggableOptions {
        minHeight: number;
        maxHeight: number;
        initialHeight: number;
      }

      export const useDraggable = (options: DraggableOptions) => {
        const [height, setHeight] = useState(options.initialHeight);
        const [isDragging, setIsDragging] = useState(false);
        const [startY, setStartY] = useState(0);

        // ドラッグ開始ハンドラー
        const handleDragStart = useCallback((clientY: number) => {
          setIsDragging(true);
          setStartY(clientY);
        }, []);

        // ドラッグ中ハンドラー
        const handleDrag = useCallback((clientY: number) => {
          if (!isDragging) return;

          const deltaY = startY - clientY;
          const newHeight = Math.min(
            Math.max(options.minHeight, height + deltaY),
            options.maxHeight
          );

          setHeight(newHeight);
          setStartY(clientY);
        }, [isDragging, startY, height, options.minHeight, options.maxHeight]);

        // ドラッグ終了ハンドラー
        const handleDragEnd = useCallback(() => {
          setIsDragging(false);
        }, []);

        // イベントリスナーの設定
        useEffect(() => {
          if (!isDragging) return;

          const handleMouseMove = (e: MouseEvent) => {
            handleDrag(e.clientY);
          };

          const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
              handleDrag(e.touches[0].clientY);
            }
          };

          const handleMouseUp = () => {
            handleDragEnd();
          };

          const handleTouchEnd = () => {
            handleDragEnd();
          };

          // イベントリスナーを追加
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('touchmove', handleTouchMove);
          document.addEventListener('mouseup', handleMouseUp);
          document.addEventListener('touchend', handleTouchEnd);

          // クリーンアップ
          return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchend', handleTouchEnd);
          };
        }, [handleDrag, handleDragEnd, isDragging]);

        return {
          height,
          setHeight,
          isDragging,
          handleDragStart,
        };
      };
      ```
   2. タッチとマウスイベントのハンドラーを実装
   3. 高さの計算と制限ロジックを追加

6. **ChatHeader の実装**
   1. ドラッグハンドルを含むヘッダーコンポーネントを作成
      ```typescript
      // frontend/src/components/chat/ChatHeader.tsx
      import React from 'react';
      import { SheetTitle, SheetClose } from '../ui/sheet';
      import { Button } from '../ui/button';
      import { X } from 'lucide-react';

      interface ChatHeaderProps {
        onDragStart: (clientY: number) => void;
      }

      export const ChatHeader: React.FC<ChatHeaderProps> = ({ onDragStart }) => {
        const handleMouseDown = (e: React.MouseEvent) => {
          onDragStart(e.clientY);
        };

        const handleTouchStart = (e: React.TouchEvent) => {
          if (e.touches.length > 0) {
            onDragStart(e.touches[0].clientY);
          }
        };

        return (
          <div
            className="p-4 border-b flex items-center justify-between cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="w-full flex flex-col items-center">
              <div className="w-10 h-1 bg-neutral-300 rounded-full mb-2" />
              <SheetTitle>チャット</SheetTitle>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-4 top-4">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
        );
      };
      ```

7. **ChatSheet の実装**
   1. Radix UI の Sheet コンポーネントをベースにしたカスタムシートを作成
      ```typescript
      // frontend/src/components/chat/ChatSheet.tsx
      import React from 'react';
      import { Sheet, SheetContent } from '../ui/sheet';
      import { ChatHeader } from './ChatHeader';
      import ChatHistory from '../ChatHistory';
      import ChatInput from '../ChatInput';
      import { useDraggable } from '../../hooks/useDraggable';
      import { useChat } from './ChatProvider';

      interface ChatSheetProps {
        isOpen: boolean;
        onClose: () => void;
        onSendMessage?: (message: string) => void;
      }

      export const ChatSheet: React.FC<ChatSheetProps> = ({
        isOpen,
        onClose,
        onSendMessage,
      }) => {
        const { messages, addMessage } = useChat();
        const { height, handleDragStart, isDragging } = useDraggable({
          minHeight: 300,
          maxHeight: window.innerHeight * 0.8,
          initialHeight: 400,
        });

        const handleSendMessage = (message: string) => {
          addMessage(message, 'user');
          onSendMessage?.(message);
        };

        return (
          <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
              side="bottom"
              className="p-0 h-auto"
              style={{ height: `${height}px` }}
            >
              <ChatHeader onDragStart={handleDragStart} />
              <div className="flex-grow overflow-hidden h-[calc(100%-120px)]">
                <ChatHistory messages={messages} />
              </div>
              <div className="p-4 border-t">
                <ChatInput onSendMessage={handleSendMessage} />
              </div>
            </SheetContent>
          </Sheet>
        );
      };
      ```
   2. ドラッグ可能なヘッダーを追加

8. **StreamingText コンポーネントの作成**
   1. 文字単位でのアニメーション表示を実装
      ```typescript
      // frontend/src/components/chat/StreamingText.tsx
      import React, { useState, useEffect } from 'react';

      interface StreamingTextProps {
        content: string;
        speed?: number;
      }

      export const StreamingText: React.FC<StreamingTextProps> = ({
        content,
        speed = 30,
      }) => {
        const [displayedText, setDisplayedText] = useState('');
        const [currentIndex, setCurrentIndex] = useState(0);

        useEffect(() => {
          if (currentIndex < content.length) {
            const timer = setTimeout(() => {
              setDisplayedText(prev => prev + content[currentIndex]);
              setCurrentIndex(prev => prev + 1);
            }, speed);

            return () => clearTimeout(timer);
          }
        }, [content, currentIndex, speed]);

        return (
          <>
            {displayedText}
            {currentIndex < content.length && (
              <span className="inline-block w-2 h-4 bg-current opacity-75 animate-pulse" />
            )}
          </>
        );
      };
      ```
   2. タイピングインジケーターを追加

9. **ChatHistory の拡張**
   1. 既存の ChatHistory コンポーネントを拡張して3種類のメッセージタイプをサポート
      ```typescript
      // frontend/src/components/chat/ExtendedChatHistory.tsx
      import { useRef, useEffect } from 'react';
      import { ExtendedMessage } from '../../types';
      import { cn } from '../../lib/utils';
      import { StreamingText } from './StreamingText';

      interface ExtendedChatHistoryProps {
        messages: ExtendedMessage[];
      }

      function ExtendedChatHistory({ messages }: ExtendedChatHistoryProps) {
        const messagesEndRef = useRef<HTMLDivElement>(null);

        const scrollToBottom = () => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        };

        useEffect(() => {
          scrollToBottom();
        }, [messages]);

        return (
          <div className="flex-grow p-3 md:p-4 overflow-y-auto space-y-4 md:space-y-6 custom-scrollbar">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-neutral-400 text-sm">会話を始めましょう</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  'animate-fade-in',
                  {
                    'flex justify-end': msg.type === 'user',
                    'flex justify-start': msg.type === 'system',
                    'flex justify-center': msg.type === 'system-message',
                  }
                )}
              >
                <div className={cn(
                  'flex flex-col max-w-[85%] sm:max-w-[75%] md:max-w-[65%]',
                  {
                    'items-end': msg.type === 'user',
                    'items-start': msg.type === 'system',
                    'items-center': msg.type === 'system-message',
                  }
                )}>
                  <div
                    className={cn(
                      'inline-block py-2 md:py-3 px-3 md:px-4 break-words',
                      {
                        'bg-neutral-700 text-white shadow-sm rounded-2xl rounded-tr-sm': msg.type === 'user',
                        'bg-white border border-neutral-200 text-neutral-800 shadow-sm rounded-2xl rounded-tl-sm': msg.type === 'system',
                        'bg-neutral-100 border border-neutral-200 text-neutral-800 shadow-sm rounded-2xl': msg.type === 'system-message',
                      }
                    )}
                  >
                    <div className="text-xs md:text-sm whitespace-pre-wrap">
                      {msg.isStreaming ? (
                        <StreamingText content={msg.content} />
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                  <div
                    className={cn(
                      'text-xs text-neutral-500 mt-1',
                      {
                        'text-right mr-1': msg.type === 'user',
                        'ml-1': msg.type === 'system',
                        'text-center': msg.type === 'system-message',
                      }
                    )}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        );
      }

      export default ExtendedChatHistory;
      ```

10. **FloatingChat メインコンポーネントの実装**
    1. すべてのコンポーネントを統合
       ```typescript
       // frontend/src/components/chat/FloatingChat.tsx
       import React, { useState, useEffect } from 'react';
       import { FloatingChatButton } from './FloatingChatButton';
       import { ChatSheet } from './ChatSheet';
       import { ChatProvider } from './ChatProvider';
       import { MessageType } from '../../types';

       interface FloatingChatProps {
         onSendMessage?: (message: string) => void;
         onClose?: () => void;
         onOpen?: () => void;
       }

       export const FloatingChat: React.FC<FloatingChatProps> = ({
         onSendMessage,
         onClose,
         onOpen,
       }) => {
         const [isOpen, setIsOpen] = useState(false);
         const [hasUnread, setHasUnread] = useState(false);

         const handleOpen = () => {
           setIsOpen(true);
           setHasUnread(false);
           onOpen?.();
         };

         const handleClose = () => {
           setIsOpen(false);
           onClose?.();
         };

         const handleSendMessage = (message: string) => {
           onSendMessage?.(message);
         };

         // 外部からメッセージを追加するためのメソッドを公開
         const addMessage = (content: string, type: MessageType) => {
           // ChatProviderのaddMessageを呼び出す実装
           // 実際の実装ではrefやコンテキストを使用
         };

         // ストリーミングメッセージを開始するためのメソッドを公開
         const startStreamingMessage = (content: string, type: MessageType) => {
           // ChatProviderのstartStreamingMessageを呼び出す実装
           setHasUnread(true);
           return '';
         };

         // ストリーミングメッセージを更新するためのメソッドを公開
         const updateStreamingMessage = (id: string, content: string) => {
           // ChatProviderのupdateStreamingMessageを呼び出す実装
         };

         // ストリーミングを終了するためのメソッドを公開
         const endStreamingMessage = (id: string) => {
           // ChatProviderのendStreamingMessageを呼び出す実装
         };

         return (
           <ChatProvider>
             {!isOpen && (
               <FloatingChatButton onClick={handleOpen} hasUnread={hasUnread} />
             )}
             <ChatSheet
               isOpen={isOpen}
               onClose={handleClose}
               onSendMessage={handleSendMessage}
             />
           </ChatProvider>
         );
       };
       ```
    2. 外部からアクセス可能なメソッドを公開

11. **各ページへの統合**
    1. App.tsx または適切なルーターファイルに FloatingChat コンポーネントを追加
       ```typescript
       // App.tsx または適切なルーターファイル
       import { FloatingChat } from './components/chat/FloatingChat';

       // 省略...

       function App() {
         const handleSendMessage = (message: string) => {
           console.log('Message sent:', message);
           // APIとの連携などの処理
         };

         return (
           <>
             <Routes>
               {/* 既存のルート */}
             </Routes>
             <FloatingChat onSendMessage={handleSendMessage} />
           </>
         );
       }
       ```

12. **テストとデバッグ**
    1. 各コンポーネントの動作確認
    2. モバイルとデスクトップでの表示テスト
    3. エッジケースの処理を確認

13. **最終調整**
    1. パフォーマンスの最適化
    2. アクセシビリティの改善
    3. アニメーションの調整

## 実装の注意点

1. **パフォーマンス最適化**:
   - メッセージリストのレンダリング最適化
   - ドラッグ操作の最適化（デバウンス処理）

2. **アクセシビリティ**:
   - キーボードナビゲーションのサポート
   - スクリーンリーダー対応

3. **レスポンシブデザイン**:
   - モバイルとデスクトップの両方で適切に動作するよう設計
   - 画面サイズに応じた最大高さの調整

4. **エラーハンドリング**:
   - メッセージ送信失敗時の処理
   - ネットワークエラーの表示

5. **テスト**:
   - コンポーネントの単体テスト
   - ドラッグ機能のテスト
   - 統合テスト
