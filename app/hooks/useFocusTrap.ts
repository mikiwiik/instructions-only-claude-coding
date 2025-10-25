import { RefObject, useCallback } from 'react';

export interface UseFocusTrapReturn {
  getFocusableElements: () => HTMLElement[];
  handleTabKey: (event: KeyboardEvent) => void;
}

/**
 * Custom hook to trap focus within a container element
 * Provides focus management for dialogs and modals
 * Cognitive complexity: ≤10
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>
): UseFocusTrapReturn {
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const selector =
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(selector)
    );
  }, [containerRef]);

  const handleTabKey = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const currentElement = document.activeElement as HTMLElement;

      // Find current index
      const currentIndex = focusableElements.indexOf(currentElement);

      if (event.shiftKey) {
        // Shift+Tab: move backward
        if (currentIndex <= 0) {
          lastElement.focus();
        } else {
          focusableElements[currentIndex - 1].focus();
        }
      } else {
        // Tab: move forward
        if (currentIndex < 0 || currentIndex >= focusableElements.length - 1) {
          firstElement.focus();
        } else {
          focusableElements[currentIndex + 1].focus();
        }
      }
    },
    [getFocusableElements]
  );

  return {
    getFocusableElements,
    handleTabKey,
  };
}
