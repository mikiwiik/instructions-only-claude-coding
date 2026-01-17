/**
 * Tests for list-manager utilities
 */

import {
  generateListId,
  buildListUrl,
  shareList,
  copyToClipboard,
} from '@/lib/list-manager';
import type { Todo } from '@/types/todo';

// Mock fetch
global.fetch = jest.fn();

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('list-manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('generateListId', () => {
    it('generates a valid UUID', () => {
      const id = generateListId();

      // UUID format: 8-4-4-4-12
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('generates unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateListId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('buildListUrl', () => {
    it('builds URL with origin and listId', () => {
      // jsdom provides window.location.origin
      const url = buildListUrl('abc-123');
      expect(url).toContain('/list/abc-123');
    });

    it('includes the origin in the URL', () => {
      const url = buildListUrl('test-id');
      expect(url).toMatch(/^https?:\/\/.+\/list\/test-id$/);
    });
  });

  describe('shareList', () => {
    const mockTodos: Todo[] = [
      {
        id: 'todo-1',
        text: 'Test todo',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        sortOrder: 'a',
      },
    ];

    it('saves todos and returns listId and url', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ todos: mockTodos }),
      });

      const result = await shareList(mockTodos);

      expect(result.listId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(result.url).toContain(`/list/${result.listId}`);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/shared/'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operation: 'replace-all', data: mockTodos }),
        })
      );
    });

    it('uses provided listId when specified', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ todos: mockTodos }),
      });

      const result = await shareList(mockTodos, 'custom-list-id');

      expect(result.listId).toBe('custom-list-id');
      expect(result.url).toContain('/list/custom-list-id');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/shared/custom-list-id/sync',
        expect.any(Object)
      );
    });

    it('throws SERVER_ERROR on non-ok response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error message' }),
      });

      await expect(shareList(mockTodos)).rejects.toMatchObject({
        code: 'SERVER_ERROR',
        message: 'Server error message',
      });
    });

    it('throws SERVER_ERROR with default message when no error in response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      await expect(shareList(mockTodos)).rejects.toMatchObject({
        code: 'SERVER_ERROR',
        message: 'Failed to save list to server',
      });
    });

    it('throws NETWORK_ERROR on fetch failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(shareList(mockTodos)).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server. Please check your connection.',
      });
    });
  });

  describe('copyToClipboard', () => {
    const originalClipboard = navigator.clipboard;

    afterEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
      });
    });

    it('uses navigator.clipboard.writeText when available', async () => {
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
      });

      const result = await copyToClipboard('test text');

      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith('test text');
    });

    it('returns false when clipboard fails', async () => {
      const mockWriteText = jest.fn().mockRejectedValue(new Error('Failed'));
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
      });

      const result = await copyToClipboard('test text');

      expect(result).toBe(false);
    });

    it('uses fallback method when clipboard API is unavailable', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
      });

      const mockExecCommand = jest.fn().mockReturnValue(true);
      document.execCommand = mockExecCommand;

      const result = await copyToClipboard('test text');

      expect(result).toBe(true);
      expect(mockExecCommand).toHaveBeenCalledWith('copy');
    });
  });
});
