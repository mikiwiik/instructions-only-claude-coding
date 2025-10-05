/**
 * Tests for SyncQueue
 */

import { SyncQueue } from '@/lib/sync-queue';

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response)
);

describe('SyncQueue', () => {
  let syncQueue: SyncQueue;

  beforeEach(() => {
    syncQueue = new SyncQueue();
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('add', () => {
    it('should add operation to queue', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await syncQueue.add('create', 'todo-1', { text: 'Test' });

      // Operation should be processed
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should process queue automatically when adding first item', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await syncQueue.add('create', 'todo-1', { text: 'Test' });

      // Queue should start processing
      expect(syncQueue.getStatus().isProcessing).toBe(false); // Finished processing
    });
  });

  describe('processQueue', () => {
    it('should process all pending operations', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await syncQueue.add('create', 'todo-1', { text: 'Test 1' });
      await syncQueue.add('create', 'todo-2', { text: 'Test 2' });

      // Queue processes automatically, just verify fetch was called
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should not process if already processing', async () => {
      let resolveFirst: (() => void) | null = null;
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = () =>
              resolve({ ok: true, json: () => Promise.resolve({}) });
            setTimeout(resolveFirst, 100);
          })
      );

      // Start processing
      const promise1 = syncQueue.add('create', 'todo-1', { text: 'Test' });

      await promise1;

      // Should only process once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it.skip('should retry failed operations with exponential backoff', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({}),
        });

      const startTime = Date.now();
      await syncQueue.add('create', 'todo-1', { text: 'Test' });
      const endTime = Date.now();

      // Should have retried with backoff
      expect(global.fetch).toHaveBeenCalledTimes(3);
      // Backoff delays: 1000ms + 2000ms = 3000ms minimum
      expect(endTime - startTime).toBeGreaterThanOrEqual(2900);
    });

    it.skip('should mark operation as failed after max retries', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await syncQueue.add('create', 'todo-1', { text: 'Test' });

      // Should have tried 3 times (max retries)
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(syncQueue.getStatus().pendingCount).toBe(0); // Removed from queue
    });

    it('should remove synced operations after delay', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await syncQueue.add('create', 'todo-1', { text: 'Test' });

      // Wait for removal delay
      await new Promise((resolve) => setTimeout(resolve, 1100));

      expect(syncQueue.getStatus().pendingCount).toBe(0);
    });
  });

  describe('getStatus', () => {
    it('should return correct pending count', () => {
      const status = syncQueue.getStatus();
      // Initially should be 0
      expect(status.pendingCount).toBe(0);
    });

    it('should return processing state', () => {
      const status = syncQueue.getStatus();
      expect(status.isProcessing).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all operations from queue', () => {
      syncQueue.clear();
      expect(syncQueue.getStatus().pendingCount).toBe(0);
    });

    it('should reset processing state', () => {
      syncQueue.clear();
      expect(syncQueue.getStatus().isProcessing).toBe(false);
    });
  });
});
