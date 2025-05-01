import { apiClient } from "../services/api/apiClient";
import { socketClient } from "../services/socket/socketClient";
import type { NewExtractionEvent } from "../services/socket/socketClient";
import { 
  Message,
  MessageType, 
  SystemMessage, 
  SystemNotification, 
  UserMessage 
} from "../types";

export interface ThemeDetailChatManagerOptions {
  themeId: string;
  themeName: string;
  onNewMessage?: (message: Message) => void;
  onNewExtraction?: (extraction: NewExtractionEvent) => void;
}

export class ThemeDetailChatManager {
  private themeId: string;
  private themeName: string;
  private messages: Message[] = [];
  private onNewMessage?: (message: Message) => void;
  private onNewExtraction?: (extraction: NewExtractionEvent) => void;
  private threadId?: string;
  private unsubscribeNewExtraction?: () => void;
  private unsubscribeExtractionUpdate?: () => void;
  private userId: string = "user-" + Date.now(); // 仮のユーザーID

  constructor(options: ThemeDetailChatManagerOptions) {
    this.themeId = options.themeId;
    this.themeName = options.themeName;
    this.onNewMessage = options.onNewMessage;
    this.onNewExtraction = options.onNewExtraction;

    this.showThemeNotification();
  }

  private showThemeNotification(): void {
    const notification = new SystemNotification(
      `「${this.themeName}」がチャット対象になりました。`
    );
    this.messages.push(notification);
    this.onNewMessage?.(notification);
  }

  async addMessage(content: string, type: MessageType): Promise<void> {
    switch (type) {
      case "user": {
        this.subscribeToExtraction();
        const userMessage = new UserMessage(content);
        
        this.messages.push(userMessage);
        this.onNewMessage?.(userMessage);
        
        await this.sendMessageToBackend(content);
        return;
      }
      case "system": {
        const systemMessage = new SystemMessage(content);
        this.messages.push(systemMessage);
        this.onNewMessage?.(systemMessage);
        break;
      }
      case "system-message": {
        const systemNotification = new SystemNotification(content);
        this.messages.push(systemNotification);
        this.onNewMessage?.(systemNotification);
        break;
      }
      default: {
        const defaultMessage = new SystemMessage(content);
        this.messages.push(defaultMessage);
        this.onNewMessage?.(defaultMessage);
      }
    }
  }
  
  private async sendMessageToBackend(userMessage: string): Promise<void> {
    try {
      const processingMessage = new SystemMessage(
        `「${this.themeName}」に関する「${userMessage}」を受け付けました。抽出処理を開始します。`
      );
      this.messages.push(processingMessage);
      this.onNewMessage?.(processingMessage);
      
      const result = await apiClient.sendMessage(
        this.userId,
        userMessage,
        this.themeId,
        this.threadId
      );
      
      if (result.isOk()) {
        const { response, threadId } = result.value;
        
        if (threadId && !this.threadId) {
          this.setThreadId(threadId);
        }
        
        if (response) {
          const systemResponse = new SystemMessage(response);
          this.messages.push(systemResponse);
          this.onNewMessage?.(systemResponse);
        }
      } else {
        const errorMessage = new SystemMessage(
          "メッセージの送信中にエラーが発生しました。"
        );
        this.messages.push(errorMessage);
        this.onNewMessage?.(errorMessage);
        console.error("Error sending message:", result.error);
      }
    } catch (error) {
      console.error("Error in sendMessageToBackend:", error);
      const errorMessage = new SystemMessage(
        "メッセージの送信中にエラーが発生しました。"
      );
      this.messages.push(errorMessage);
      this.onNewMessage?.(errorMessage);
    }
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
    const notificationContent =
      type === "problem"
        ? `「${data.statement}」という課題が登録されました。`
        : `「${data.statement}」という解決策が登録されました。`;

    const notification = new SystemNotification(notificationContent);
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

  getMessages(): Message[] {
    return [...this.messages];
  }

  clearMessages(): void {
    this.messages = [];
  }
}
