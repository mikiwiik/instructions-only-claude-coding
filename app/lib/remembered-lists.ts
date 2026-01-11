/**
 * Remembered lists localStorage management
 *
 * Tracks shared lists the user has visited for easy access.
 * Stores up to 50 lists, sorted by last accessed time.
 */

export interface RememberedList {
  listId: string;
  name?: string;
  lastAccessed: Date;
  isOwner: boolean;
}

// Storage format uses ISO string for date serialization
type StoredRememberedList = Omit<RememberedList, 'lastAccessed'> & {
  lastAccessed: string;
};

const STORAGE_KEY = 'remembered-lists';
const MAX_LISTS = 50;

/**
 * Safely access localStorage with error handling
 */
function getStorage(): Storage | null {
  try {
    return localStorage;
  } catch {
    return null;
  }
}

/**
 * Parse stored lists from localStorage
 */
function parseStoredLists(storage: Storage): RememberedList[] {
  try {
    const stored = storage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as StoredRememberedList[];
    return parsed.map((item) => ({
      ...item,
      lastAccessed: new Date(item.lastAccessed),
    }));
  } catch {
    return [];
  }
}

/**
 * Save lists to localStorage
 */
function saveToStorage(storage: Storage, lists: RememberedList[]): void {
  const toStore: StoredRememberedList[] = lists.map((item) => ({
    ...item,
    lastAccessed: item.lastAccessed.toISOString(),
  }));
  storage.setItem(STORAGE_KEY, JSON.stringify(toStore));
}

/**
 * Get all remembered lists, sorted by lastAccessed descending (most recent first)
 */
export function getRememberedLists(): RememberedList[] {
  const storage = getStorage();
  if (!storage) {
    return [];
  }

  const lists = parseStoredLists(storage);
  return lists.sort(
    (a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime()
  );
}

/**
 * Add or update a remembered list
 * If the list already exists, it will be updated with new values
 * Enforces maximum of 50 lists, removing oldest when limit reached
 */
export function addRememberedList(
  list: Omit<RememberedList, 'lastAccessed'> & { lastAccessed?: Date }
): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  const lists = parseStoredLists(storage);
  const existingIndex = lists.findIndex((l) => l.listId === list.listId);

  const newList: RememberedList = {
    ...list,
    lastAccessed: list.lastAccessed ?? new Date(),
  };

  if (existingIndex >= 0) {
    // Update existing list
    lists[existingIndex] = newList;
  } else {
    // Add new list
    lists.push(newList);

    // Enforce max limit by removing oldest
    if (lists.length > MAX_LISTS) {
      const sorted = lists.sort(
        (a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime()
      );
      lists.length = MAX_LISTS;
      lists.splice(0, lists.length, ...sorted.slice(0, MAX_LISTS));
    }
  }

  saveToStorage(storage, lists);
}

/**
 * Update the lastAccessed timestamp for a list
 */
export function updateLastAccessed(listId: string): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  const lists = parseStoredLists(storage);
  const list = lists.find((l) => l.listId === listId);

  if (list) {
    list.lastAccessed = new Date();
    saveToStorage(storage, lists);
  }
}

/**
 * Remove a remembered list by ID
 */
export function removeRememberedList(listId: string): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  const lists = parseStoredLists(storage);
  const filtered = lists.filter((l) => l.listId !== listId);
  saveToStorage(storage, filtered);
}

/**
 * Clear all remembered lists
 */
export function clearRememberedLists(): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(STORAGE_KEY);
}
