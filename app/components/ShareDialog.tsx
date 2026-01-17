'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { useDialogKeyboard } from '../hooks/useDialogKeyboard';
import { copyToClipboard } from '../lib/list-manager';

export interface ShareDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Function to call when dialog should be closed */
  onClose: () => void;
  /** The shareable URL to display */
  shareUrl: string;
  /** Whether the share operation is in progress */
  isSharing?: boolean;
  /** Error message if share failed */
  error?: string;
}

interface ShareDialogHeaderProps {
  isSharing: boolean;
  error?: string;
}

function ShareDialogHeader({
  isSharing,
  error,
}: Readonly<ShareDialogHeaderProps>) {
  const getIcon = () => {
    if (isSharing) {
      return (
        <span
          className='flex h-6 w-6 items-center justify-center'
          aria-hidden='true'
        >
          <span className='animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full' />
        </span>
      );
    }
    if (error) {
      return <X className='h-6 w-6 text-destructive' aria-hidden='true' />;
    }
    return <Share2 className='h-6 w-6 text-primary' aria-hidden='true' />;
  };

  const getTitle = () => {
    if (isSharing) return 'Sharing list...';
    if (error) return 'Share failed';
    return 'List shared!';
  };

  return (
    <div className='flex items-start gap-4 mb-4'>
      <div className='flex-shrink-0'>{getIcon()}</div>
      <div className='flex-1 min-w-0'>
        <h2
          id='share-dialog-title'
          className='text-lg md:text-xl font-semibold text-foreground text-balance'
        >
          {getTitle()}
        </h2>
      </div>
    </div>
  );
}

interface ShareUrlInputProps {
  shareUrl: string;
  copied: boolean;
  onCopy: () => void;
}

function ShareUrlInput({
  shareUrl,
  copied,
  onCopy,
}: Readonly<ShareUrlInputProps>) {
  return (
    <div className='mb-6'>
      <label
        htmlFor='share-url'
        className='block text-sm font-medium text-foreground mb-2'
      >
        Share URL
      </label>
      <div className='flex gap-2'>
        <input
          id='share-url'
          type='text'
          readOnly
          value={shareUrl}
          className='flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
          onClick={(e) => e.currentTarget.select()}
        />
        <button
          onClick={onCopy}
          className='px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center gap-2'
          type='button'
          aria-label={copied ? 'Copied to clipboard' : 'Copy URL'}
        >
          {copied ? (
            <>
              <Check className='h-4 w-4' aria-hidden='true' />
              <span className='sr-only md:not-sr-only'>Copied!</span>
            </>
          ) : (
            <>
              <Copy className='h-4 w-4' aria-hidden='true' />
              <span className='sr-only md:not-sr-only'>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ShareDialog({
  isOpen,
  onClose,
  shareUrl,
  isSharing = false,
  error,
}: Readonly<ShareDialogProps>) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const handleCopy = useCallback(async () => {
    if (isSharing || error || !shareUrl) return;

    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [isSharing, error, shareUrl]);

  // Keyboard event handlers - wrap async handleCopy to return void
  useDialogKeyboard({
    isOpen,
    onClose,
    onConfirm: () => void handleCopy(),
    dialogRef,
    isLoading: isSharing,
    isConfirmDisabled: isSharing || !!error,
  });

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === backdropRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  const handleBackdropKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleBackdropClick(event as unknown as React.MouseEvent);
      }
    },
    [handleBackdropClick]
  );

  if (!isOpen) return null;

  const getMessage = () => {
    if (isSharing) return 'Creating your shareable list...';
    if (error) return error;
    return 'Anyone with this link can view and edit this list.';
  };

  const showUrlInput = !isSharing && !error && shareUrl;

  return (
    <div
      ref={backdropRef}
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in'
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      role='presentation'
    >
      <div
        ref={dialogRef}
        className='relative w-full max-w-md bg-background rounded-lg shadow-lg border fade-in safe-area-inset'
        role='dialog'
        aria-modal='true'
        aria-labelledby='share-dialog-title'
        aria-describedby='share-dialog-description'
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className='absolute top-4 right-4 p-2 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center'
          aria-label='Close dialog'
          type='button'
        >
          <X className='h-4 w-4' />
        </button>

        {/* Content */}
        <div className='p-6 md:p-8'>
          <ShareDialogHeader isSharing={isSharing} error={error} />

          <p
            id='share-dialog-description'
            className='text-sm md:text-base text-muted-foreground leading-relaxed mb-6 text-balance'
          >
            {getMessage()}
          </p>

          {showUrlInput && (
            <ShareUrlInput
              shareUrl={shareUrl}
              copied={copied}
              onCopy={handleCopy}
            />
          )}

          {/* Action buttons */}
          <div className='flex flex-col md:flex-row gap-3 md:gap-4 md:justify-end'>
            {showUrlInput && (
              <a
                href={shareUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='flex-1 md:flex-none px-4 md:px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors min-h-[48px] text-sm md:text-base flex items-center justify-center gap-2'
              >
                <ExternalLink className='h-4 w-4' aria-hidden='true' />
                Open in new tab
              </a>
            )}
            <button
              onClick={onClose}
              className='flex-1 md:flex-none px-4 md:px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors min-h-[48px] text-sm md:text-base'
              type='button'
            >
              {error ? 'Close' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
