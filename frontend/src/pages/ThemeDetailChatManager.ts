import { socketClient } from "../services/socket/socketClient";
import type { NewExtractionEvent } from "../services/socket/socketClient";
import { MessageType, ExtendedMessage } from "../types";

export interface ThemeDetailChatManagerOptions {
  themeId: string;
  themeName: string;
  onNewMessage?: (message: ExtendedMessage) => void;
  onNewExtraction?: (extraction: NewExtractionEvent) => void;
}

export class ThemeDetailChatManager {
  private themeId: string;
  private themeName: string;
  private messages: ExtendedMessage[] = [];
  private onNewMessage?: (message: ExtendedMessage) => void;
  private onNewExtraction?: (extraction: NewExtractionEvent) => void;
  private threadId?: string;
  private unsubscribeNewExtraction?: () => void;
  private unsubscribeExtractionUpdate?: () => void;

  constructor(options: ThemeDetailChatManagerOptions) {
    this.themeId = options.themeId;
    this.themeName = options.themeName;
    this.onNewMessage = options.onNewMessage;
    this.onNewExtraction = options.onNewExtraction;

    this.showThemeNotification();
  }

  private showThemeNotification(): void {
    const notification: ExtendedMessage = {
      role: "system",
      content: `「${this.themeName}」がチャット対象になりました。`,
      timestamp: new Date(),
      type: "system-message",
    };
    this.messages.push(notification);
    this.onNewMessage?.(notification);
  }

  addMessage(content: string, type: MessageType): void {
    let newMessage: ExtendedMessage;

    switch (type) {
      case "user":
        this.subscribeToExtraction();
        newMessage = {
          role: "user",
          content,
          timestamp: new Date(),
          type,
        };
        break;
      case "system":
        newMessage = {
          role: "system",
          content,
          timestamp: new Date(),
          type,
        };
        break;
      case "system-message":
        newMessage = {
          role: "system",
          content,
          timestamp: new Date(),
          type,
        };
        break;
      default:
        newMessage = {
          role: "system",
          content,
          timestamp: new Date(),
          type: "system",
        };
    }

    this.messages.push(newMessage);
    this.onNewMessage?.(newMessage);
  }

  private subscribeToExtraction(): void {
    socketClient.subscribeToTheme(this.themeId);
    
    if (this.threadId) {
      socketClient.subscribeToThread(this.threadId);
    }

    if (this.unsubscribeNewExtraction) {
      this.unsubscribeNewExtraction();
    }
    if (this.unsubscribeExtractionUpdate) {
      this.unsubscribeExtractionUpdate();
    }

    this.unsubscribeNewExtraction = socketClient.onNewExtraction(
      this.handleNewExtraction.bind(this)
    );
    this.unsubscribeExtractionUpdate = socketClient.onExtractionUpdate(
      this.handleExtractionUpdate.bind(this)
    );
  }

  private handleNewExtraction(event: NewExtractionEvent): void {
    const { type, data } = event;
    
    const notificationContent = type === 'problem' 
      ? `「${data.statement}」という課題が登録されました。`
      : `「${data.statement}」という解決策が登録されました。`;
    
    const notification: ExtendedMessage = {
      role: "system",
      content: notificationContent,
      timestamp: new Date(),
      type: "system-message",
    };
    this.messages.push(notification);
    this.onNewMessage?.(notification);
    
    this.onNewExtraction?.(event);
  }

  private handleExtractionUpdate(event: NewExtractionEvent): void {
    this.onNewExtraction?.(event);
  }

  setThreadId(threadId: string): void {
    this.threadId = threadId;
    
    socketClient.subscribeToThread(threadId);
  }

  cleanup(): void {
    if (this.unsubscribeNewExtraction) {
      this.unsubscribeNewExtraction();
    }
    if (this.unsubscribeExtractionUpdate) {
      this.unsubscribeExtractionUpdate();
    }

    socketClient.unsubscribeFromTheme(this.themeId);
    
    if (this.threadId) {
      socketClient.unsubscribeFromThread(this.threadId);
    }
  }

  getMessages(): ExtendedMessage[] {
    return [...this.messages];
  }

  clearMessages(): void {
    this.messages = [];
  }
}
