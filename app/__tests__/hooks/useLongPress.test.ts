import { renderHook, act } from '@testing-library/react';
import { useLongPress } from '../../hooks/useLongPress';

describe('useLongPress', () => {
  const mockOnLongPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should trigger long press after delay on touch', () => {
    const { result } = renderHook(() =>
      useLongPress({
        onLongPress: mockOnLongPress,
        delay: 500,
      })
    );

    const touchStartEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart(touchStartEvent);
    });

    expect(mockOnLongPress).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockOnLongPress).toHaveBeenCalledTimes(1);
  });

  it('should trigger long press after delay on mouse', () => {
    const { result } = renderHook(() =>
      useLongPress({
        onLongPress: mockOnLongPress,
        delay: 500,
      })
    );

    const mouseDownEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.onMouseDown(mouseDownEvent);
    });

    expect(mockOnLongPress).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockOnLongPress).toHaveBeenCalledTimes(1);
  });

  it('should cancel long press on touch end', () => {
    const { result } = renderHook(() =>
      useLongPress({
        onLongPress: mockOnLongPress,
        delay: 500,
      })
    );

    const touchStartEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart(touchStartEvent);
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    act(() => {
      result.current.onTouchEnd();
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(mockOnLongPress).not.toHaveBeenCalled();
  });

  it('should cancel long press on touch move', () => {
    const { result } = renderHook(() =>
      useLongPress({
        onLongPress: mockOnLongPress,
        delay: 500,
      })
    );

    const touchStartEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart(touchStartEvent);
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    act(() => {
      result.current.onTouchMove();
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(mockOnLongPress).not.toHaveBeenCalled();
  });

  it('should cancel long press on mouse up', () => {
    const { result } = renderHook(() =>
      useLongPress({
        onLongPress: mockOnLongPress,
        delay: 500,
      })
    );

    const mouseDownEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.onMouseDown(mouseDownEvent);
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    act(() => {
      result.current.onMouseUp();
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(mockOnLongPress).not.toHaveBeenCalled();
  });

  it('should cancel long press on mouse leave', () => {
    const { result } = renderHook(() =>
      useLongPress({
        onLongPress: mockOnLongPress,
        delay: 500,
      })
    );

    const mouseDownEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.onMouseDown(mouseDownEvent);
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    act(() => {
      result.current.onMouseLeave();
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(mockOnLongPress).not.toHaveBeenCalled();
  });

  it('should use custom delay', () => {
    const { result } = renderHook(() =>
      useLongPress({
        onLongPress: mockOnLongPress,
        delay: 1000,
      })
    );

    const touchStartEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart(touchStartEvent);
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockOnLongPress).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockOnLongPress).toHaveBeenCalledTimes(1);
  });

  it('should not prevent default when configured', () => {
    const { result } = renderHook(() =>
      useLongPress({
        onLongPress: mockOnLongPress,
        shouldPreventDefault: false,
      })
    );

    const touchStartEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart(touchStartEvent);
    });

    expect(touchStartEvent.preventDefault).not.toHaveBeenCalled();
  });
});
