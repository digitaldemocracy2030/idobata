import type React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import type { ExtendedMessage, MessageType } from '../../types';

interface ChatContextType {
  messages: ExtendedMessage[];
  addMessage: (content: string, type: MessageType) => void;
  startStreamingMessage: (content: string, type: MessageType) => string;
  updateStreamingMessage: (id: string, content: string) => void;
  endStreamingMessage: (id: string) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);

  const addMessage = useCallback((content: string, type: MessageType) => {
    const newMessage: ExtendedMessage = {
      role: type === 'user' ? 'user' : 'assistant',
      content,
      type,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const startStreamingMessage = useCallback(
    (content: string, type: MessageType) => {
      const id = Date.now().toString();
      const newMessage: ExtendedMessage = {
        role: type === 'user' ? 'user' : 'assistant',
        content,
        type,
        timestamp: new Date(),
        isStreaming: true,
        id,
      };

      setMessages((prev) => [...prev, newMessage]);
      return id;
    },
    []
  );

  const updateStreamingMessage = useCallback((id: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content } : msg))
    );
  }, []);

  const endStreamingMessage = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, isStreaming: false } : msg))
    );
  }, []);

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
