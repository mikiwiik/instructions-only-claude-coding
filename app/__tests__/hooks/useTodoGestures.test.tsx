import { renderHook, act } from '@testing-library/react';
import { useTodoGestures } from '../../hooks/useTodoGestures';

describe('useTodoGestures', () => {
  const mockOnSwipeLeft = jest.fn();
  const mockOnSwipeRight = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('swipe gestures', () => {
    it('should detect swipe right gesture', () => {
      const { result } = renderHook(() =>
        useTodoGestures({
          onSwipeRight: mockOnSwipeRight,
          onSwipeLeft: mockOnSwipeLeft,
          swipeThreshold: 100,
        })
      );

      const touchStartEvent = {
        touches: [{ clientX: 0, clientY: 0 }],
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 150, clientY: 0 }],
      } as unknown as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStartEvent);
        result.current.onTouchMove(touchMoveEvent);
        result.current.onTouchEnd();
      });

      expect(mockOnSwipeRight).toHaveBeenCalledTimes(1);
      expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    });

    it('should detect swipe left gesture', () => {
      const { result } = renderHook(() =>
        useTodoGestures({
          onSwipeRight: mockOnSwipeRight,
          onSwipeLeft: mockOnSwipeLeft,
          swipeThreshold: 100,
        })
      );

      const touchStartEvent = {
        touches: [{ clientX: 150, clientY: 0 }],
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 0, clientY: 0 }],
      } as unknown as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStartEvent);
        result.current.onTouchMove(touchMoveEvent);
        result.current.onTouchEnd();
      });

      expect(mockOnSwipeLeft).toHaveBeenCalledTimes(1);
      expect(mockOnSwipeRight).not.toHaveBeenCalled();
    });

    it('should not trigger swipe if movement is below threshold', () => {
      const { result } = renderHook(() =>
        useTodoGestures({
          onSwipeRight: mockOnSwipeRight,
          onSwipeLeft: mockOnSwipeLeft,
          swipeThreshold: 100,
        })
      );

      const touchStartEvent = {
        touches: [{ clientX: 0, clientY: 0 }],
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 50, clientY: 0 }],
      } as unknown as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStartEvent);
        result.current.onTouchMove(touchMoveEvent);
        result.current.onTouchEnd();
      });

      expect(mockOnSwipeRight).not.toHaveBeenCalled();
      expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    });

    it('should use custom swipeThreshold', () => {
      const { result } = renderHook(() =>
        useTodoGestures({
          onSwipeRight: mockOnSwipeRight,
          onSwipeLeft: mockOnSwipeLeft,
          swipeThreshold: 200,
        })
      );

      const touchStartEvent = {
        touches: [{ clientX: 0, clientY: 0 }],
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 150, clientY: 0 }],
      } as unknown as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStartEvent);
        result.current.onTouchMove(touchMoveEvent);
        result.current.onTouchEnd();
      });

      expect(mockOnSwipeRight).not.toHaveBeenCalled();
      expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    });

    it('should reset touch state after swipe', () => {
      const { result } = renderHook(() =>
        useTodoGestures({
          onSwipeRight: mockOnSwipeRight,
          onSwipeLeft: mockOnSwipeLeft,
          swipeThreshold: 100,
        })
      );

      const touchStartEvent = {
        touches: [{ clientX: 0, clientY: 0 }],
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 150, clientY: 0 }],
      } as unknown as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStartEvent);
        result.current.onTouchMove(touchMoveEvent);
        result.current.onTouchEnd();
      });

      expect(mockOnSwipeRight).toHaveBeenCalledTimes(1);

      // Try another swipe
      act(() => {
        result.current.onTouchStart(touchStartEvent);
        result.current.onTouchMove(touchMoveEvent);
        result.current.onTouchEnd();
      });

      expect(mockOnSwipeRight).toHaveBeenCalledTimes(2);
    });
  });

  describe('edge cases', () => {
    it('should handle missing touch coordinates gracefully', () => {
      const { result } = renderHook(() =>
        useTodoGestures({
          onSwipeRight: mockOnSwipeRight,
          onSwipeLeft: mockOnSwipeLeft,
        })
      );

      const invalidTouchEvent = {
        touches: [],
      } as unknown as React.TouchEvent;

      expect(() => {
        act(() => {
          result.current.onTouchStart(invalidTouchEvent);
          result.current.onTouchMove(invalidTouchEvent);
          result.current.onTouchEnd();
        });
      }).not.toThrow();

      expect(mockOnSwipeRight).not.toHaveBeenCalled();
      expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    });

    it('should handle touchEnd without touchStart', () => {
      const { result } = renderHook(() =>
        useTodoGestures({
          onSwipeRight: mockOnSwipeRight,
          onSwipeLeft: mockOnSwipeLeft,
        })
      );

      expect(() => {
        act(() => {
          result.current.onTouchEnd();
        });
      }).not.toThrow();

      expect(mockOnSwipeRight).not.toHaveBeenCalled();
      expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    });

    it('should handle touchMove without touchStart', () => {
      const { result } = renderHook(() =>
        useTodoGestures({
          onSwipeRight: mockOnSwipeRight,
          onSwipeLeft: mockOnSwipeLeft,
        })
      );

      const touchMoveEvent = {
        touches: [{ clientX: 150, clientY: 0 }],
      } as unknown as React.TouchEvent;

      expect(() => {
        act(() => {
          result.current.onTouchMove(touchMoveEvent);
        });
      }).not.toThrow();

      expect(mockOnSwipeRight).not.toHaveBeenCalled();
      expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    });

    it('should ignore vertical swipes', () => {
      const { result } = renderHook(() =>
        useTodoGestures({
          onSwipeRight: mockOnSwipeRight,
          onSwipeLeft: mockOnSwipeLeft,
          swipeThreshold: 100,
        })
      );

      const touchStartEvent = {
        touches: [{ clientX: 0, clientY: 0 }],
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 10, clientY: 150 }],
      } as unknown as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStartEvent);
        result.current.onTouchMove(touchMoveEvent);
        result.current.onTouchEnd();
      });

      expect(mockOnSwipeRight).not.toHaveBeenCalled();
      expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    });
  });

  describe('optional callbacks', () => {
    it('should work with only onSwipeRight callback', () => {
      const { result } = renderHook(() =>
        useTodoGestures({
          onSwipeRight: mockOnSwipeRight,
          swipeThreshold: 100,
        })
      );

      const touchStartEvent = {
        touches: [{ clientX: 0, clientY: 0 }],
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 150, clientY: 0 }],
      } as unknown as React.TouchEvent;

      expect(() => {
        act(() => {
          result.current.onTouchStart(touchStartEvent);
          result.current.onTouchMove(touchMoveEvent);
          result.current.onTouchEnd();
        });
      }).not.toThrow();

      expect(mockOnSwipeRight).toHaveBeenCalledTimes(1);
    });

    it('should work with only onSwipeLeft callback', () => {
      const { result } = renderHook(() =>
        useTodoGestures({
          onSwipeLeft: mockOnSwipeLeft,
          swipeThreshold: 100,
        })
      );

      const touchStartEvent = {
        touches: [{ clientX: 150, clientY: 0 }],
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 0, clientY: 0 }],
      } as unknown as React.TouchEvent;

      expect(() => {
        act(() => {
          result.current.onTouchStart(touchStartEvent);
          result.current.onTouchMove(touchMoveEvent);
          result.current.onTouchEnd();
        });
      }).not.toThrow();

      expect(mockOnSwipeLeft).toHaveBeenCalledTimes(1);
    });

    it('should work with no callbacks', () => {
      const { result } = renderHook(() =>
        useTodoGestures({
          swipeThreshold: 100,
        })
      );

      const touchStartEvent = {
        touches: [{ clientX: 0, clientY: 0 }],
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 150, clientY: 0 }],
      } as unknown as React.TouchEvent;

      expect(() => {
        act(() => {
          result.current.onTouchStart(touchStartEvent);
          result.current.onTouchMove(touchMoveEvent);
          result.current.onTouchEnd();
        });
      }).not.toThrow();
    });
  });

  describe('default values', () => {
    it('should use default swipeThreshold of 100', () => {
      const { result } = renderHook(() =>
        useTodoGestures({
          onSwipeRight: mockOnSwipeRight,
        })
      );

      const touchStartEvent = {
        touches: [{ clientX: 0, clientY: 0 }],
      } as unknown as React.TouchEvent;

      const touchMoveEvent = {
        touches: [{ clientX: 101, clientY: 0 }],
      } as unknown as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStartEvent);
        result.current.onTouchMove(touchMoveEvent);
        result.current.onTouchEnd();
      });

      expect(mockOnSwipeRight).toHaveBeenCalledTimes(1);
    });
  });

  describe('multiple swipes', () => {
    it('should handle rapid consecutive swipes', () => {
      const { result } = renderHook(() =>
        useTodoGestures({
          onSwipeRight: mockOnSwipeRight,
          onSwipeLeft: mockOnSwipeLeft,
          swipeThreshold: 100,
        })
      );

      // Swipe right
      act(() => {
        result.current.onTouchStart({
          touches: [{ clientX: 0, clientY: 0 }],
        } as unknown as React.TouchEvent);
        result.current.onTouchMove({
          touches: [{ clientX: 150, clientY: 0 }],
        } as unknown as React.TouchEvent);
        result.current.onTouchEnd();
      });

      // Swipe left
      act(() => {
        result.current.onTouchStart({
          touches: [{ clientX: 150, clientY: 0 }],
        } as unknown as React.TouchEvent);
        result.current.onTouchMove({
          touches: [{ clientX: 0, clientY: 0 }],
        } as unknown as React.TouchEvent);
        result.current.onTouchEnd();
      });

      expect(mockOnSwipeRight).toHaveBeenCalledTimes(1);
      expect(mockOnSwipeLeft).toHaveBeenCalledTimes(1);
    });
  });
});
