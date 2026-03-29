import { renderHook, act } from '@testing-library/react';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import * as listManager from '../../lib/list-manager';

jest.mock('../../lib/list-manager', () => ({
  copyToClipboard: jest.fn(),
}));

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns copied as false initially', () => {
    const { result } = renderHook(() =>
      useCopyToClipboard('https://example.com')
    );

    expect(result.current.copied).toBe(false);
    expect(typeof result.current.copy).toBe('function');
  });

  it('sets copied to true after successful copy', async () => {
    (listManager.copyToClipboard as jest.Mock).mockResolvedValueOnce(true);

    const { result } = renderHook(() =>
      useCopyToClipboard('https://example.com')
    );

    await act(async () => {
      await result.current.copy();
    });

    expect(result.current.copied).toBe(true);
    expect(listManager.copyToClipboard).toHaveBeenCalledWith(
      'https://example.com'
    );
  });

  it('does not set copied on failed copy', async () => {
    (listManager.copyToClipboard as jest.Mock).mockResolvedValueOnce(false);

    const { result } = renderHook(() =>
      useCopyToClipboard('https://example.com')
    );

    await act(async () => {
      await result.current.copy();
    });

    expect(result.current.copied).toBe(false);
  });

  it('resets copied to false after 2 seconds', async () => {
    (listManager.copyToClipboard as jest.Mock).mockResolvedValueOnce(true);

    const { result } = renderHook(() =>
      useCopyToClipboard('https://example.com')
    );

    await act(async () => {
      await result.current.copy();
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.copied).toBe(false);
  });

  it('clears timeout on unmount to prevent state update on unmounted component', async () => {
    (listManager.copyToClipboard as jest.Mock).mockResolvedValueOnce(true);
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    const { result, unmount } = renderHook(() =>
      useCopyToClipboard('https://example.com')
    );

    await act(async () => {
      await result.current.copy();
    });

    expect(result.current.copied).toBe(true);

    unmount();

    // clearTimeout should have been called during cleanup
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });

  it('clears previous timeout when copy is called again', async () => {
    (listManager.copyToClipboard as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() =>
      useCopyToClipboard('https://example.com')
    );

    await act(async () => {
      await result.current.copy();
    });

    // Advance partway through the timeout
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.copied).toBe(true);

    // Copy again - should reset the timer
    await act(async () => {
      await result.current.copy();
    });

    // Advance another 1500ms (total 2500ms from first copy, but only 1500ms from second)
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // Should still be copied because the second timer hasn't expired
    expect(result.current.copied).toBe(true);

    // Advance the remaining 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.copied).toBe(false);
  });

  it('returns success value from copy function', async () => {
    (listManager.copyToClipboard as jest.Mock).mockResolvedValueOnce(true);

    const { result } = renderHook(() =>
      useCopyToClipboard('https://example.com')
    );

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.copy();
    });

    expect(success).toBe(true);
  });

  it('updates copy target when text prop changes', async () => {
    (listManager.copyToClipboard as jest.Mock).mockResolvedValue(true);

    const { result, rerender } = renderHook(
      ({ text }) => useCopyToClipboard(text),
      { initialProps: { text: 'https://first.com' } }
    );

    rerender({ text: 'https://second.com' });

    await act(async () => {
      await result.current.copy();
    });

    expect(listManager.copyToClipboard).toHaveBeenCalledWith(
      'https://second.com'
    );
  });
});
