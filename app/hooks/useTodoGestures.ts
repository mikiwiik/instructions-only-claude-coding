import { useCallback, useRef } from 'react';

export interface UseTodoGesturesOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
}

export interface UseTodoGesturesReturn {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

/**
 * Custom hook to handle swipe gestures on todo items
 * Detects horizontal swipes and triggers appropriate callbacks
 * Cognitive complexity: ≤15
 */
export function useTodoGestures({
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 100,
}: UseTodoGesturesOptions): UseTodoGesturesReturn {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);
  const touchCurrentY = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) return;

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchCurrentX.current = e.touches[0].clientX;
    touchCurrentY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) return;

    touchCurrentX.current = e.touches[0].clientX;
    touchCurrentY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(() => {
    const startX = touchStartX.current;
    const startY = touchStartY.current;
    const currentX = touchCurrentX.current;
    const currentY = touchCurrentY.current;

    // Reset touch state
    touchStartX.current = null;
    touchStartY.current = null;
    touchCurrentX.current = null;
    touchCurrentY.current = null;

    // No valid touch coordinates
    if (
      startX === null ||
      currentX === null ||
      startY === null ||
      currentY === null
    ) {
      return;
    }

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // Check if horizontal movement exceeds threshold and is primarily horizontal
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    const exceedsThreshold = Math.abs(deltaX) >= swipeThreshold;

    if (!isHorizontalSwipe || !exceedsThreshold) {
      return;
    }

    // Trigger appropriate callback based on swipe direction
    if (deltaX > 0 && onSwipeRight) {
      onSwipeRight();
    } else if (deltaX < 0 && onSwipeLeft) {
      onSwipeLeft();
    }
  }, [onSwipeLeft, onSwipeRight, swipeThreshold]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
