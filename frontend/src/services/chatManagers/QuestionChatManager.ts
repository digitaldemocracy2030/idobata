import { apiClient } from "../../services/api/apiClient";
import { socketClient } from "../../services/socket/socketClient";
import type { NewExtractionEvent } from "../../services/socket/socketClient";
import {
  Message,
  MessageType,
  SystemMessage,
  SystemNotification,
  UserMessage,
} from "../../types";

export interface QuestionChatManagerOptions {
  themeId: string;
  questionId: string;
  questionText: string;
  userId: string;
  onNewMessage?: (message: Message) => void;
  onNewExtraction?: (extraction: NewExtractionEvent) => void;
}

export class QuestionChatManager {
  private themeId: string;
  private questionId: string;
  private questionText: string;
  private messages: Message[] = [];
  private onNewMessage?: (message: Message) => void;
  private onNewExtraction?: (extraction: NewExtractionEvent) => void;
  private threadId?: string;
  private unsubscribeNewExtraction?: () => void;
  private unsubscribeExtractionUpdate?: () => void;
  private userId: string;
  private hasShownNotification = false; // Flag to track if notification has been shown

  constructor(options: QuestionChatManagerOptions) {
    this.themeId = options.themeId;
    this.questionId = options.questionId;
    this.questionText = options.questionText;
    this.onNewMessage = options.onNewMessage;
    this.onNewExtraction = options.onNewExtraction;
    this.userId = options.userId;

    this.loadChatHistory().then(() => {
      if (this.threadId) {
        this.subscribeToExtraction();
      }
    });
  }

  private showQuestionNotification(): void {
    if (this.hasShownNotification) return; // Skip if notification already shown

    const notification = new SystemNotification(
      `「${this.questionText}」がチャット対象になりました。`
    );
    this.messages.push(notification);
    this.onNewMessage?.(notification);

    this.hasShownNotification = true; // Mark notification as shown
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
      const questionThreadUserId = `${this.userId}_question_${this.questionId}`;
      const result = await apiClient.sendQuestionMessage(
        questionThreadUserId,
        userMessage,
        this.themeId,
        this.questionId,
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
    console.log(
      `[QuestionChatManager] Subscribing to theme: ${this.themeId} and question: ${this.questionId}`
    );
    socketClient.subscribeToTheme(this.themeId);
    if (this.threadId) {
      console.log(
        `[QuestionChatManager] Subscribing to thread: ${this.threadId}`
      );
      socketClient.subscribeToThread(this.threadId);
    }

    if (this.unsubscribeNewExtraction) {
      console.log(
        "[QuestionChatManager] Unsubscribing from previous new-extraction"
      );
      this.unsubscribeNewExtraction();
    }
    if (this.unsubscribeExtractionUpdate) {
      console.log(
        "[QuestionChatManager] Unsubscribing from previous extraction-update"
      );
      this.unsubscribeExtractionUpdate();
    }

    console.log("[QuestionChatManager] Registering new-extraction handler");
    this.unsubscribeNewExtraction = socketClient.onNewExtraction(
      this.handleNewExtraction.bind(this)
    );
    console.log("[QuestionChatManager] Registering extraction-update handler");
    this.unsubscribeExtractionUpdate = socketClient.onExtractionUpdate(
      this.handleExtractionUpdate.bind(this)
    );
  }

  private handleNewExtraction(event: NewExtractionEvent): void {
    console.log(
      "[QuestionChatManager] handleNewExtraction called with event:",
      event
    );
    const { type, data } = event;
    const notificationContent =
      type === "problem"
        ? `「${data.statement}」という課題が登録されました。`
        : `「${data.statement}」という解決策が登録されました。`;

    console.log(
      `[QuestionChatManager] Creating notification: ${notificationContent}`
    );
    const notification = new SystemNotification(notificationContent);
    this.messages.push(notification);

    console.log("[QuestionChatManager] Calling onNewMessage callback");
    this.onNewMessage?.(notification);

    console.log("[QuestionChatManager] Calling onNewExtraction callback");
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

  private saveThreadIdToStorage(): void {
    if (this.threadId) {
      localStorage.setItem(
        `chat_thread_${this.themeId}_${this.questionId}`,
        this.threadId
      );
    }
  }

  private isLoadingChatHistory = false;

  async loadChatHistory(): Promise<void> {
    if (this.isLoadingChatHistory) {
      console.log(
        "[QuestionChatManager] loadChatHistory already in progress, skipping duplicate call"
      );
      return;
    }

    this.isLoadingChatHistory = true;

    try {
      if (!this.userId) {
        console.log("No user ID available, cannot load chat history");
        return;
      }

      const questionThreadUserId = `${this.userId}_question_${this.questionId}`;

      const result = await apiClient.getThreadByUserAndTheme(
        questionThreadUserId,
        this.themeId
      );

      if (!result.isOk()) {
        console.error("Error loading chat history:", result.error);
        return;
      }

      const { threadId, messages } = result.value;

      this.threadId = threadId;
      this.saveThreadIdToStorage();

      if (!messages || messages.length === 0) {
        console.log("No chat history found");
        this.showQuestionNotification();
        return;
      }

      this.clearMessages();

      this.showQuestionNotification();

      for (const msg of messages as Array<{ role: string; content: string }>) {
        const { role, content } = msg;

        if (role === "user") {
          const userMessage = new UserMessage(content);
          this.messages.push(userMessage);
          this.onNewMessage?.(userMessage);
        } else if (role === "assistant") {
          const systemMessage = new SystemMessage(content);
          this.messages.push(systemMessage);
          this.onNewMessage?.(systemMessage);
        }
      }

      console.log(`Loaded ${messages.length} messages from chat history`);
    } finally {
      this.isLoadingChatHistory = false;
    }
  }
}
