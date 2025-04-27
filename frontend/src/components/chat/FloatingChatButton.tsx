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
