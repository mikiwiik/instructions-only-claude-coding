'use client';

import { useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export interface ConfirmationDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Function to call when dialog should be closed */
  onClose: () => void;
  /** Function to call when user confirms the action */
  onConfirm: () => void;
  /** Title of the dialog */
  title: string;
  /** Message to display in the dialog */
  message: string;
  /** Text for the confirm button (defaults to "Delete") */
  confirmLabel?: string;
  /** Text for the cancel button (defaults to "Cancel") */
  cancelLabel?: string;
  /** Type of confirmation - affects styling (defaults to "destructive") */
  variant?: 'destructive' | 'warning' | 'info';
  /** Loading state for the confirm button */
  isLoading?: boolean;
  /** Disable confirm button */
  isConfirmDisabled?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  isLoading = false,
  isConfirmDisabled = false,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus the cancel button initially for safer default
      cancelButtonRef.current?.focus();

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Keyboard event handlers
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'Enter':
          event.preventDefault();
          if (!isLoading && !isConfirmDisabled) {
            onConfirm();
          }
          break;
        case 'Tab': {
          // Trap focus within dialog
          event.preventDefault();
          const focusableElements = dialogRef.current?.querySelectorAll(
            'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );

          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[
              focusableElements.length - 1
            ] as HTMLElement;

            if (event.shiftKey) {
              if (document.activeElement === firstElement) {
                lastElement.focus();
              } else {
                const currentIndex = Array.from(focusableElements).indexOf(
                  document.activeElement as HTMLElement
                );
                // TODO: Refactor to reduce nesting depth - see docs/quality/remaining-complexity-fixes.md
                // eslint-disable-next-line max-depth
                if (currentIndex > 0) {
                  (focusableElements[currentIndex - 1] as HTMLElement).focus();
                }
              }
            } else {
              if (document.activeElement === lastElement) {
                firstElement.focus();
              } else {
                const currentIndex = Array.from(focusableElements).indexOf(
                  document.activeElement as HTMLElement
                );
                // TODO: Refactor to reduce nesting depth - see docs/quality/remaining-complexity-fixes.md
                // eslint-disable-next-line max-depth
                if (currentIndex < focusableElements.length - 1) {
                  (focusableElements[currentIndex + 1] as HTMLElement).focus();
                }
              }
            }
          }
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm, isLoading, isConfirmDisabled]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === backdropRef.current) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          icon: (
            <AlertTriangle
              className='h-6 w-6 text-destructive'
              aria-hidden='true'
            />
          ),
          confirmButton:
            'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive',
        };
      case 'warning':
        return {
          icon: (
            <AlertTriangle
              className='h-6 w-6 text-yellow-500'
              aria-hidden='true'
            />
          ),
          confirmButton:
            'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
        };
      case 'info':
        return {
          icon: (
            <AlertTriangle
              className='h-6 w-6 text-blue-500'
              aria-hidden='true'
            />
          ),
          confirmButton:
            'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
        };
      default:
        return {
          icon: (
            <AlertTriangle
              className='h-6 w-6 text-destructive'
              aria-hidden='true'
            />
          ),
          confirmButton:
            'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive',
        };
    }
  };

  const variantStyles = getVariantStyles();

  const handleBackdropKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleBackdropClick(event as unknown as React.MouseEvent);
    }
  };

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
        aria-labelledby='dialog-title'
        aria-describedby='dialog-description'
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 p-2 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center'
          aria-label='Close dialog'
          type='button'
        >
          <X className='h-4 w-4' />
        </button>

        {/* Content */}
        <div className='p-6 sm:p-8'>
          {/* Header with icon and title */}
          <div className='flex items-start gap-4 mb-4'>
            <div className='flex-shrink-0'>{variantStyles.icon}</div>
            <div className='flex-1 min-w-0'>
              <h2
                id='dialog-title'
                className='text-lg sm:text-xl font-semibold text-foreground text-balance'
              >
                {title}
              </h2>
            </div>
          </div>

          {/* Message */}
          <p
            id='dialog-description'
            className='text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 text-balance'
          >
            {message}
          </p>

          {/* Action buttons */}
          <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end'>
            <button
              ref={cancelButtonRef}
              onClick={onClose}
              className='flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors min-h-[48px] text-sm sm:text-base order-2 sm:order-1'
              type='button'
              aria-label={`${cancelLabel} action`}
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmButtonRef}
              onClick={onConfirm}
              disabled={isLoading || isConfirmDisabled}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors min-h-[48px] text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 ${variantStyles.confirmButton}`}
              type='button'
              aria-label={`${confirmLabel} action`}
              aria-disabled={isLoading || isConfirmDisabled}
            >
              {isLoading ? (
                <span className='flex items-center justify-center gap-2'>
                  <span
                    className='animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full'
                    aria-hidden='true'
                  />
                  Loading...
                </span>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
