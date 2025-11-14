/**
 * Touch event handler collection
 * Accepts both React.TouchEvent and DOM TouchEvent for flexibility
 */
export interface TouchHandlers {
  onTouchStart?: (e: unknown) => void;
  onTouchMove?: (e?: unknown) => void;
  onTouchEnd?: () => void;
}

/**
 * Combines multiple touch handler sets into a single handler set
 * Executes all handlers in order when called
 * Cognitive complexity: ≤5
 *
 * @param handlerSets - Variable number of touch handler sets to combine
 * @returns Combined touch handlers that execute all provided handlers
 *
 * @example
 * ```ts
 * const swipe = useSwipeGesture(...);
 * const longPress = useLongPress(...);
 * const combined = combineTouchHandlers(swipe, longPress);
 *
 * <div {...combined}>Content</div>
 * ```
 */
export function combineTouchHandlers(
  ...handlerSets: TouchHandlers[]
): TouchHandlers {
  return {
    onTouchStart: (e: unknown) => {
      handlerSets.forEach((handlers) => handlers.onTouchStart?.(e));
    },
    onTouchMove: (e?: unknown) => {
      handlerSets.forEach((handlers) => handlers.onTouchMove?.(e));
    },
    onTouchEnd: () => {
      handlerSets.forEach((handlers) => handlers.onTouchEnd?.());
    },
  };
}
