/**
 * Upstash Redis store wrapper for todo lists
 *
 * In production/development: Uses Upstash Redis (requires UPSTASH_REDIS_REST_URL and TOKEN)
 * In test environment: Uses in-memory Map for E2E testing without external dependencies
 *
 * See docs/setup/upstash-setup.md for configuration instructions.
 * See docs/architecture/overview.md for environment behavior.
 */

import { Redis } from '@upstash/redis';
import type { Todo } from '@/types/todo';

export interface SharedTodoList {
  id: string;
  todos: Todo[];
  lastModified: number;
  subscribers: string[];
}

// Use in-memory store for E2E tests (set USE_IN_MEMORY_STORE=true in CI workflow)
// Note: Unit tests use Jest mock, E2E tests use this in-memory fallback
// istanbul ignore next -- evaluated at module load, E2E tested
const useInMemoryStore = process.env.USE_IN_MEMORY_STORE === 'true';

// In-memory store for testing (E2E tested, not unit tested)
// istanbul ignore next -- E2E tested
const inMemoryStore = new Map<string, SharedTodoList>();

// Initialize Redis client only when not using in-memory store
// istanbul ignore next -- conditional on env var, E2E tested
const redis = useInMemoryStore
  ? null
  : new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

// istanbul ignore next -- E2E tested
if (useInMemoryStore) {
  // eslint-disable-next-line no-console
  console.log('[KVStore] E2E test mode: using in-memory store');
}

/**
 * Reset the in-memory store (for E2E testing only)
 * Only works when USE_IN_MEMORY_STORE=true
 */
// istanbul ignore next -- E2E tested
export function resetInMemoryStore(): void {
  // Check env directly in case module was loaded before env was set
  if (process.env.USE_IN_MEMORY_STORE === 'true') {
    inMemoryStore.clear();
    // eslint-disable-next-line no-console
    console.log('[KVStore] In-memory store reset');
  }
}

export class KVStore {
  private static getListKey(listId: string): string {
    return `shared:list:${listId}`;
  }

  static async getList(listId: string): Promise<SharedTodoList | null> {
    const key = this.getListKey(listId);
    /* istanbul ignore else -- E2E tested in-memory path */
    if (redis) {
      return await redis.get<SharedTodoList>(key);
    }
    return inMemoryStore.get(key) ?? null;
  }

  static async setList(
    listId: string,
    todos: Todo[],
    userId: string
  ): Promise<void> {
    const key = this.getListKey(listId);
    const list: SharedTodoList = {
      id: listId,
      todos,
      lastModified: Date.now(),
      subscribers: [userId],
    };
    /* istanbul ignore else -- E2E tested in-memory path */
    if (redis) {
      await redis.set(key, list);
    } else {
      inMemoryStore.set(key, list);
    }
  }

  static async updateTodos(listId: string, todos: Todo[]): Promise<void> {
    const key = this.getListKey(listId);
    const existing = await this.getList(listId);

    if (!existing) {
      throw new Error('List not found');
    }

    const updated: SharedTodoList = {
      ...existing,
      todos,
      lastModified: Date.now(),
    };
    /* istanbul ignore else -- E2E tested in-memory path */
    if (redis) {
      await redis.set(key, updated);
    } else {
      inMemoryStore.set(key, updated);
    }
  }

  static async addSubscriber(listId: string, userId: string): Promise<void> {
    const list = await this.getList(listId);

    if (!list) {
      throw new Error('List not found');
    }

    if (!list.subscribers.includes(userId)) {
      list.subscribers.push(userId);
      const key = this.getListKey(listId);
      /* istanbul ignore else -- E2E tested in-memory path */
      if (redis) {
        await redis.set(key, list);
      } else {
        inMemoryStore.set(key, list);
      }
    }
  }

  static async removeSubscriber(listId: string, userId: string): Promise<void> {
    const list = await this.getList(listId);

    if (!list) {
      return;
    }

    list.subscribers = list.subscribers.filter((id) => id !== userId);
    const key = this.getListKey(listId);
    /* istanbul ignore else -- E2E tested in-memory path */
    if (redis) {
      await redis.set(key, list);
    } else {
      inMemoryStore.set(key, list);
    }
  }

  static async deleteList(listId: string): Promise<void> {
    const key = this.getListKey(listId);
    /* istanbul ignore else -- E2E tested in-memory path */
    if (redis) {
      await redis.del(key);
    } else {
      inMemoryStore.delete(key);
    }
  }
}
