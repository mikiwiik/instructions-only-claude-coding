import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useSyncToBackend,
  useDebouncedSync,
  MAIN_LIST_ID,
} from '../../hooks/useTodoSync';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useSyncToBackend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it('should make fetch call with correct parameters', async () => {
    const { result } = renderHook(() => useSyncToBackend());

    await act(async () => {
      await result.current('update', { id: '123', text: 'test' });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `/api/shared/${MAIN_LIST_ID}/sync`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'update',
          data: { id: '123', text: 'test' },
        }),
      })
    );
  });

  it('should use custom listId when provided', async () => {
    const { result } = renderHook(() => useSyncToBackend('custom-list'));

    await act(async () => {
      await result.current('update', { id: '123' });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/shared/custom-list/sync',
      expect.any(Object)
    );
  });

  it('should throw error on failed response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() => useSyncToBackend());

    await expect(
      act(async () => {
        await result.current('update', { id: '123' });
      })
    ).rejects.toThrow('Sync failed: Internal Server Error');
  });
});

describe('useDebouncedSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce rapid sync calls', async () => {
    const { result } = renderHook(() => useDebouncedSync());

    // Fire multiple rapid calls
    act(() => {
      result.current.sync('update', { id: '1' });
      result.current.sync('update', { id: '2' });
      result.current.sync('update', { id: '3' });
    });

    // No calls yet (debounce waiting)
    expect(mockFetch).not.toHaveBeenCalled();

    // Advance past debounce delay
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    // Only the last call should be made
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ operation: 'update', data: { id: '3' } }),
      })
    );
  });

  it('should execute first call immediately with leading edge', async () => {
    const { result } = renderHook(() => useDebouncedSync({ leading: true }));

    await act(async () => {
      result.current.sync('update', { id: '1' });
    });

    // First call executes immediately
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Subsequent rapid calls are debounced
    act(() => {
      result.current.sync('update', { id: '2' });
      result.current.sync('update', { id: '3' });
    });

    // Still only one call
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // After debounce, the last queued call executes
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should allow single operations without delay when leading is true', async () => {
    const { result } = renderHook(() => useDebouncedSync({ leading: true }));

    await act(async () => {
      result.current.sync('create', { text: 'new todo' });
    });

    // Should execute immediately
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          operation: 'create',
          data: { text: 'new todo' },
        }),
      })
    );
  });

  it('should use custom debounce delay', async () => {
    const { result } = renderHook(() => useDebouncedSync({ delay: 500 }));

    act(() => {
      result.current.sync('update', { id: '1' });
    });

    // Advance 350ms - should not have fired yet
    await act(async () => {
      jest.advanceTimersByTime(350);
    });
    expect(mockFetch).not.toHaveBeenCalled();

    // Advance to 500ms - should fire now
    await act(async () => {
      jest.advanceTimersByTime(150);
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should cancel pending debounce on unmount', async () => {
    const { result, unmount } = renderHook(() => useDebouncedSync());

    act(() => {
      result.current.sync('update', { id: '1' });
    });

    // Unmount before debounce completes
    unmount();

    // Advance time - call should not execute
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should provide flush method to execute immediately', async () => {
    const { result } = renderHook(() => useDebouncedSync());

    act(() => {
      result.current.sync('update', { id: '1' });
    });

    expect(mockFetch).not.toHaveBeenCalled();

    // Flush pending call
    await act(async () => {
      result.current.flush();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  it('should provide cancel method to discard pending call', () => {
    const { result } = renderHook(() => useDebouncedSync());

    act(() => {
      result.current.sync('update', { id: '1' });
    });

    // Cancel pending call
    act(() => {
      result.current.cancel();
    });

    // Advance time - call should not execute
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
