import { renderHook, act } from '@testing-library/react';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';

describe('useSwipeGesture', () => {
  const mockOnSwipeLeft = jest.fn();
  const mockOnSwipeRight = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should detect swipe right gesture', () => {
    const { result } = renderHook(() =>
      useSwipeGesture({
        onSwipeRight: mockOnSwipeRight,
        onSwipeLeft: mockOnSwipeLeft,
      })
    );

    // Simulate touch start
    const touchStartEvent = {
      touches: [{ clientX: 50, clientY: 100 }],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart(touchStartEvent);
    });

    // Simulate touch move
    const touchMoveEvent = {
      touches: [{ clientX: 200, clientY: 105 }],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchMove(touchMoveEvent);
    });

    // Simulate touch end
    act(() => {
      result.current.onTouchEnd();
    });

    expect(mockOnSwipeRight).toHaveBeenCalledTimes(1);
    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
  });

  it('should detect swipe left gesture', () => {
    const { result } = renderHook(() =>
      useSwipeGesture({
        onSwipeRight: mockOnSwipeRight,
        onSwipeLeft: mockOnSwipeLeft,
      })
    );

    // Simulate touch start
    const touchStartEvent = {
      touches: [{ clientX: 200, clientY: 100 }],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart(touchStartEvent);
    });

    // Simulate touch move
    const touchMoveEvent = {
      touches: [{ clientX: 50, clientY: 105 }],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchMove(touchMoveEvent);
    });

    // Simulate touch end
    act(() => {
      result.current.onTouchEnd();
    });

    expect(mockOnSwipeLeft).toHaveBeenCalledTimes(1);
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
  });

  it('should not trigger swipe if distance is too short', () => {
    const { result } = renderHook(() =>
      useSwipeGesture({
        onSwipeRight: mockOnSwipeRight,
        onSwipeLeft: mockOnSwipeLeft,
        minSwipeDistance: 100,
      })
    );

    // Simulate short swipe
    const touchStartEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart(touchStartEvent);
    });

    const touchMoveEvent = {
      touches: [{ clientX: 150, clientY: 105 }],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchMove(touchMoveEvent);
    });

    act(() => {
      result.current.onTouchEnd();
    });

    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
  });

  it('should not trigger swipe if vertical movement is too large', () => {
    const { result } = renderHook(() =>
      useSwipeGesture({
        onSwipeRight: mockOnSwipeRight,
        onSwipeLeft: mockOnSwipeLeft,
        maxVerticalMovement: 50,
      })
    );

    // Simulate swipe with large vertical movement
    const touchStartEvent = {
      touches: [{ clientX: 50, clientY: 100 }],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart(touchStartEvent);
    });

    const touchMoveEvent = {
      touches: [{ clientX: 200, clientY: 200 }],
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchMove(touchMoveEvent);
    });

    act(() => {
      result.current.onTouchEnd();
    });

    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
  });

  it('should not trigger if touchEnd is called without touchStart', () => {
    const { result } = renderHook(() =>
      useSwipeGesture({
        onSwipeRight: mockOnSwipeRight,
        onSwipeLeft: mockOnSwipeLeft,
      })
    );

    act(() => {
      result.current.onTouchEnd();
    });

    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
  });
});
