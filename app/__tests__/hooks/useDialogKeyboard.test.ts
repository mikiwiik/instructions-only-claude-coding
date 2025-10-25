import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';
import { useDialogKeyboard } from '../../hooks/useDialogKeyboard';

describe('useDialogKeyboard', () => {
  let container: HTMLDivElement;
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should handle Escape key to close dialog', () => {
    const containerRef = { current: container } as RefObject<HTMLElement>;

    renderHook(() =>
      useDialogKeyboard({
        isOpen: true,
        onClose: mockOnClose,
        onConfirm: mockOnConfirm,
        dialogRef: containerRef,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should handle Enter key to confirm', () => {
    const containerRef = { current: container } as RefObject<HTMLElement>;

    renderHook(() =>
      useDialogKeyboard({
        isOpen: true,
        onClose: mockOnClose,
        onConfirm: mockOnConfirm,
        dialogRef: containerRef,
        isLoading: false,
        isConfirmDisabled: false,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(event);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should not confirm on Enter when loading', () => {
    const containerRef = { current: container } as RefObject<HTMLElement>;

    renderHook(() =>
      useDialogKeyboard({
        isOpen: true,
        onClose: mockOnClose,
        onConfirm: mockOnConfirm,
        dialogRef: containerRef,
        isLoading: true,
        isConfirmDisabled: false,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(event);

    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should not confirm on Enter when disabled', () => {
    const containerRef = { current: container } as RefObject<HTMLElement>;

    renderHook(() =>
      useDialogKeyboard({
        isOpen: true,
        onClose: mockOnClose,
        onConfirm: mockOnConfirm,
        dialogRef: containerRef,
        isLoading: false,
        isConfirmDisabled: true,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(event);

    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should handle Tab key for focus trap', () => {
    const button = document.createElement('button');
    container.appendChild(button);

    const containerRef = { current: container } as RefObject<HTMLElement>;

    renderHook(() =>
      useDialogKeyboard({
        isOpen: true,
        onClose: mockOnClose,
        onConfirm: mockOnConfirm,
        dialogRef: containerRef,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    document.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should not handle keys when dialog is closed', () => {
    const containerRef = { current: container } as RefObject<HTMLElement>;

    renderHook(() =>
      useDialogKeyboard({
        isOpen: false,
        onClose: mockOnClose,
        onConfirm: mockOnConfirm,
        dialogRef: containerRef,
      })
    );

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(enterEvent);

    expect(mockOnClose).not.toHaveBeenCalled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should cleanup event listeners on unmount', () => {
    const containerRef = { current: container } as RefObject<HTMLElement>;
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useDialogKeyboard({
        isOpen: true,
        onClose: mockOnClose,
        onConfirm: mockOnConfirm,
        dialogRef: containerRef,
      })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });

  it('should re-register listeners when isOpen changes', () => {
    const containerRef = { current: container } as RefObject<HTMLElement>;

    const { rerender } = renderHook(
      ({ isOpen }) =>
        useDialogKeyboard({
          isOpen,
          onClose: mockOnClose,
          onConfirm: mockOnConfirm,
          dialogRef: containerRef,
        }),
      { initialProps: { isOpen: true } }
    );

    // Close dialog
    rerender({ isOpen: false });

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    expect(mockOnClose).not.toHaveBeenCalled();

    // Open dialog again
    rerender({ isOpen: true });

    document.dispatchEvent(event);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
