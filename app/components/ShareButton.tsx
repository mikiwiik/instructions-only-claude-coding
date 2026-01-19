'use client';

import { useState, useCallback } from 'react';
import { Share2 } from 'lucide-react';
import ShareDialog from './ShareDialog';
import { shareList } from '../lib/list-manager';
import { addRememberedList } from '../lib/remembered-lists';
import type { Todo } from '../types/todo';

export interface ShareButtonProps {
  /** The todos to share */
  todos: Todo[];
  /** Callback when list is successfully shared */
  onShared?: (listId: string, url: string) => void;
  /** Whether the button should be disabled */
  disabled?: boolean;
}

export default function ShareButton({
  todos,
  onShared,
  disabled = false,
}: Readonly<ShareButtonProps>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState<string | undefined>();
  // Session counter to force dialog remount on new share operations
  const [shareSession, setShareSession] = useState(0);

  const handleShare = useCallback(async () => {
    setShareSession((prev) => prev + 1);
    setIsDialogOpen(true);
    setIsSharing(true);
    setError(undefined);
    setShareUrl('');

    try {
      const result = await shareList(todos);

      // Add to remembered lists
      addRememberedList({
        listId: result.listId,
        isOwner: true,
      });

      setShareUrl(result.url);
      onShared?.(result.listId, result.url);
    } catch (err) {
      // Check for ShareListError-like structure (has code and message)
      const errorObj = err as { code?: string; message?: string };
      if (errorObj.code && errorObj.message) {
        setError(errorObj.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSharing(false);
    }
  }, [todos, onShared]);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setShareUrl('');
      setError(undefined);
    }, 300);
  }, []);

  return (
    <>
      <button
        onClick={handleShare}
        disabled={disabled || todos.length === 0}
        className='inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors min-h-[44px] text-sm disabled:opacity-50 disabled:cursor-not-allowed'
        type='button'
        aria-label='Share this list'
      >
        <Share2 className='h-4 w-4' aria-hidden='true' />
        Share List
      </button>

      <ShareDialog
        key={shareSession}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        shareUrl={shareUrl}
        isSharing={isSharing}
        error={error}
      />
    </>
  );
}
