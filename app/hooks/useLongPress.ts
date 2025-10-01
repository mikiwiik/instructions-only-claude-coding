import { useRef, useCallback, TouchEvent, MouseEvent } from 'react';

export interface LongPressConfig {
  onLongPress: () => void;
  delay?: number;
  shouldPreventDefault?: boolean;
}

export function useLongPress({
  onLongPress,
  delay = 500,
  shouldPreventDefault = true,
}: LongPressConfig) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const start = useCallback(
    (event: TouchEvent | MouseEvent) => {
      if (shouldPreventDefault && 'preventDefault' in event) {
        event.preventDefault();
      }

      isLongPressRef.current = false;

      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress();
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      start(event);
    },
    [start]
  );

  const handleTouchEnd = useCallback(() => {
    clear();
  }, [clear]);

  const handleTouchMove = useCallback(() => {
    // Cancel long press if user moves finger
    clear();
  }, [clear]);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      start(event);
    },
    [start]
  );

  const handleMouseUp = useCallback(() => {
    clear();
  }, [clear]);

  const handleMouseLeave = useCallback(() => {
    clear();
  }, [clear]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
  };
}
