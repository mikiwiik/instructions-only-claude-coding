/**
 * Tests for remembered lists localStorage functionality
 */

import {
  getRememberedLists,
  addRememberedList,
  updateLastAccessed,
  removeRememberedList,
  clearRememberedLists,
  type RememberedList,
} from '@/lib/remembered-lists';

describe('remembered-lists', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
      get length() {
        return Object.keys(store).length;
      },
      key: jest.fn((index: number) => Object.keys(store)[index] || null),
    };
  })();

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock.clear();
    jest.clearAllMocks();
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  describe('getRememberedLists', () => {
    it('returns empty array when no data exists', () => {
      const result = getRememberedLists();
      expect(result).toEqual([]);
    });

    it('returns lists sorted by lastAccessed descending', () => {
      const lists: RememberedList[] = [
        {
          listId: 'list-1',
          lastAccessed: new Date('2024-01-01'),
          isOwner: true,
        },
        {
          listId: 'list-2',
          lastAccessed: new Date('2024-01-03'),
          isOwner: false,
        },
        {
          listId: 'list-3',
          lastAccessed: new Date('2024-01-02'),
          isOwner: true,
        },
      ];
      localStorageMock.setItem(
        'remembered-lists',
        JSON.stringify(
          lists.map((l) => ({
            ...l,
            lastAccessed: l.lastAccessed.toISOString(),
          }))
        )
      );

      const result = getRememberedLists();

      expect(result).toHaveLength(3);
      expect(result[0].listId).toBe('list-2'); // Most recent first
      expect(result[1].listId).toBe('list-3');
      expect(result[2].listId).toBe('list-1'); // Oldest last
    });

    it('parses ISO date strings to Date objects', () => {
      const isoDate = '2024-06-15T10:30:00.000Z';
      const lists = [
        { listId: 'list-1', lastAccessed: isoDate, isOwner: true },
      ];
      localStorageMock.setItem('remembered-lists', JSON.stringify(lists));

      const result = getRememberedLists();

      expect(result[0].lastAccessed).toBeInstanceOf(Date);
      expect(result[0].lastAccessed.toISOString()).toBe(isoDate);
    });

    it('returns empty array when localStorage is unavailable', () => {
      Object.defineProperty(global, 'localStorage', {
        get: () => {
          throw new Error('localStorage not available');
        },
        configurable: true,
      });

      const result = getRememberedLists();
      expect(result).toEqual([]);
    });

    it('returns empty array when localStorage contains invalid JSON', () => {
      localStorageMock.setItem('remembered-lists', 'invalid-json');

      const result = getRememberedLists();
      expect(result).toEqual([]);
    });
  });

  describe('addRememberedList', () => {
    it('adds new list with current timestamp when lastAccessed not provided', () => {
      const before = new Date();
      addRememberedList({ listId: 'list-1', isOwner: true });
      const after = new Date();

      const lists = getRememberedLists();
      expect(lists).toHaveLength(1);
      expect(lists[0].listId).toBe('list-1');
      expect(lists[0].isOwner).toBe(true);
      expect(lists[0].lastAccessed.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(lists[0].lastAccessed.getTime()).toBeLessThanOrEqual(
        after.getTime()
      );
    });

    it('adds new list with provided lastAccessed timestamp', () => {
      const specificDate = new Date('2024-03-15T12:00:00Z');
      addRememberedList({
        listId: 'list-1',
        isOwner: true,
        lastAccessed: specificDate,
      });

      const lists = getRememberedLists();
      expect(lists[0].lastAccessed.toISOString()).toBe(
        specificDate.toISOString()
      );
    });

    it('adds new list with optional name', () => {
      addRememberedList({
        listId: 'list-1',
        name: 'My Shopping List',
        isOwner: true,
      });

      const lists = getRememberedLists();
      expect(lists[0].name).toBe('My Shopping List');
    });

    it('updates existing list if same listId already exists', () => {
      addRememberedList({ listId: 'list-1', isOwner: true, name: 'Original' });
      addRememberedList({ listId: 'list-1', isOwner: false, name: 'Updated' });

      const lists = getRememberedLists();
      expect(lists).toHaveLength(1);
      expect(lists[0].name).toBe('Updated');
      expect(lists[0].isOwner).toBe(false);
    });

    it('removes oldest list when limit of 50 is reached', () => {
      // Add 50 lists with sequential dates
      for (let i = 0; i < 50; i++) {
        const date = new Date(2024, 0, i + 1);
        addRememberedList({
          listId: `list-${i}`,
          isOwner: true,
          lastAccessed: date,
        });
      }

      expect(getRememberedLists()).toHaveLength(50);

      // Add one more list
      addRememberedList({
        listId: 'list-new',
        isOwner: true,
        lastAccessed: new Date(2024, 1, 1),
      });

      const lists = getRememberedLists();
      expect(lists).toHaveLength(50);
      // Oldest list (list-0) should be removed
      expect(lists.find((l) => l.listId === 'list-0')).toBeUndefined();
      // New list should be present
      expect(lists.find((l) => l.listId === 'list-new')).toBeDefined();
    });

    it('handles localStorage unavailable gracefully', () => {
      Object.defineProperty(global, 'localStorage', {
        get: () => {
          throw new Error('localStorage not available');
        },
        configurable: true,
      });

      // Should not throw
      expect(() =>
        addRememberedList({ listId: 'list-1', isOwner: true })
      ).not.toThrow();
    });
  });

  describe('updateLastAccessed', () => {
    it('updates timestamp for existing list', () => {
      const oldDate = new Date('2024-01-01');
      addRememberedList({
        listId: 'list-1',
        isOwner: true,
        lastAccessed: oldDate,
      });

      const beforeUpdate = new Date();
      updateLastAccessed('list-1');
      const afterUpdate = new Date();

      const lists = getRememberedLists();
      expect(lists[0].lastAccessed.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime()
      );
      expect(lists[0].lastAccessed.getTime()).toBeLessThanOrEqual(
        afterUpdate.getTime()
      );
    });

    it('does nothing for non-existent list', () => {
      addRememberedList({ listId: 'list-1', isOwner: true });

      // Should not throw
      expect(() => updateLastAccessed('non-existent')).not.toThrow();

      // Original list should be unchanged
      const lists = getRememberedLists();
      expect(lists).toHaveLength(1);
      expect(lists[0].listId).toBe('list-1');
    });

    it('handles localStorage unavailable gracefully', () => {
      Object.defineProperty(global, 'localStorage', {
        get: () => {
          throw new Error('localStorage not available');
        },
        configurable: true,
      });

      expect(() => updateLastAccessed('list-1')).not.toThrow();
    });
  });

  describe('removeRememberedList', () => {
    it('removes list by ID', () => {
      addRememberedList({ listId: 'list-1', isOwner: true });
      addRememberedList({ listId: 'list-2', isOwner: false });

      removeRememberedList('list-1');

      const lists = getRememberedLists();
      expect(lists).toHaveLength(1);
      expect(lists[0].listId).toBe('list-2');
    });

    it('does nothing for non-existent list', () => {
      addRememberedList({ listId: 'list-1', isOwner: true });

      expect(() => removeRememberedList('non-existent')).not.toThrow();

      const lists = getRememberedLists();
      expect(lists).toHaveLength(1);
    });

    it('handles localStorage unavailable gracefully', () => {
      Object.defineProperty(global, 'localStorage', {
        get: () => {
          throw new Error('localStorage not available');
        },
        configurable: true,
      });

      expect(() => removeRememberedList('list-1')).not.toThrow();
    });
  });

  describe('clearRememberedLists', () => {
    it('removes all lists', () => {
      addRememberedList({ listId: 'list-1', isOwner: true });
      addRememberedList({ listId: 'list-2', isOwner: false });
      addRememberedList({ listId: 'list-3', isOwner: true });

      clearRememberedLists();

      const lists = getRememberedLists();
      expect(lists).toEqual([]);
    });

    it('handles localStorage unavailable gracefully', () => {
      Object.defineProperty(global, 'localStorage', {
        get: () => {
          throw new Error('localStorage not available');
        },
        configurable: true,
      });

      expect(() => clearRememberedLists()).not.toThrow();
    });
  });

  describe('date serialization', () => {
    it('dates round-trip correctly through storage', () => {
      const originalDate = new Date('2024-06-15T14:30:45.123Z');
      addRememberedList({
        listId: 'list-1',
        isOwner: true,
        lastAccessed: originalDate,
      });

      // Clear the mock's internal cache to force re-parsing
      const stored = localStorageMock.getItem('remembered-lists');
      localStorageMock.clear();
      localStorageMock.setItem('remembered-lists', stored!);

      const lists = getRememberedLists();
      expect(lists[0].lastAccessed.toISOString()).toBe(
        originalDate.toISOString()
      );
    });
  });
});
