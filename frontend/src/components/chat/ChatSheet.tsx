import React from 'react';
import { Sheet, SheetContent } from '../ui/sheet';
import { ChatHeader } from './ChatHeader';
import ExtendedChatHistory from './ExtendedChatHistory';
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
          <ExtendedChatHistory messages={messages} />
        </div>
        <div className="p-4 border-t">
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
