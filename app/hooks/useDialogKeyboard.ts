import { useEffect, RefObject } from 'react';
import { useFocusTrap } from './useFocusTrap';

export interface UseDialogKeyboardOptions {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  dialogRef: RefObject<HTMLElement>;
  isLoading?: boolean;
  isConfirmDisabled?: boolean;
}

/**
 * Custom hook to handle keyboard events in dialogs
 * Manages Escape, Enter, and Tab key interactions
 * Cognitive complexity: ≤10
 */
export function useDialogKeyboard({
  isOpen,
  onClose,
  onConfirm,
  dialogRef,
  isLoading = false,
  isConfirmDisabled = false,
}: UseDialogKeyboardOptions): void {
  const { handleTabKey } = useFocusTrap(dialogRef);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (!isLoading && !isConfirmDisabled) {
          onConfirm();
        }
        return;
      }

      if (event.key === 'Tab') {
        handleTabKey(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm, handleTabKey, isLoading, isConfirmDisabled]);
}
