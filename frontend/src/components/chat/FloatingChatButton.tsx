import { Send } from 'lucide-react';
import type React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface FloatingChatButtonProps {
  onClick: () => void;
  hasUnread?: boolean;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onClick,
  hasUnread = false,
}) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div
        className={cn(
          'flex items-center bg-white border border-neutral-200 rounded-full shadow-lg p-1 pr-2',
          hasUnread && 'animate-pulse'
        )}
      >
        <input
          type="text"
          placeholder="気になること・思ったことをAIに質問"
          className="flex-grow px-4 py-2 bg-transparent border-none focus:outline-none text-sm"
          readOnly
          onClick={onClick}
        />
        <Button
          onClick={onClick}
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 flex items-center justify-center"
        >
          <Send className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500" />
          )}
        </Button>
      </div>
    </div>
  );
};
