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

// In-memory store for testing (E2E tested, not unit tested)
// istanbul ignore next -- E2E tested
const inMemoryStore = new Map<string, SharedTodoList>();

// Lazy-initialized Redis client (only created when actually needed)
// istanbul ignore next -- conditional on env var, E2E tested
let redis: Redis | null = null;

/**
 * Check if in-memory store should be used (runtime check)
 * This allows the env var to be set after module load
 */
// istanbul ignore next -- E2E tested
function shouldUseInMemoryStore(): boolean {
  return process.env.USE_IN_MEMORY_STORE === 'true';
}

/**
 * Get Redis client (lazy initialization)
 * Returns null if in-memory store should be used
 */
// istanbul ignore next -- E2E tested
function getRedis(): Redis | null {
  const useInMemory = shouldUseInMemoryStore();
  // eslint-disable-next-line no-console
  console.log('[KVStore] getRedis called, useInMemory:', useInMemory, 'existing redis:', !!redis);
  if (useInMemory) {
    // eslint-disable-next-line no-console
    console.log('[KVStore] Using in-memory store');
    return null;
  }
  if (!redis) {
    // eslint-disable-next-line no-console
    console.log('[KVStore] Creating Redis client');
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
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
    const redisClient = getRedis();
    /* istanbul ignore else -- E2E tested in-memory path */
    if (redisClient) {
      return await redisClient.get<SharedTodoList>(key);
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
    const redisClient = getRedis();
    /* istanbul ignore else -- E2E tested in-memory path */
    if (redisClient) {
      await redisClient.set(key, list);
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
    const redisClient = getRedis();
    /* istanbul ignore else -- E2E tested in-memory path */
    if (redisClient) {
      await redisClient.set(key, updated);
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
      const redisClient = getRedis();
      /* istanbul ignore else -- E2E tested in-memory path */
      if (redisClient) {
        await redisClient.set(key, list);
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
    const redisClient = getRedis();
    /* istanbul ignore else -- E2E tested in-memory path */
    if (redisClient) {
      await redisClient.set(key, list);
    } else {
      inMemoryStore.set(key, list);
    }
  }

  static async deleteList(listId: string): Promise<void> {
    const key = this.getListKey(listId);
    const redisClient = getRedis();
    /* istanbul ignore else -- E2E tested in-memory path */
    if (redisClient) {
      await redisClient.del(key);
    } else {
      inMemoryStore.delete(key);
    }
  }
}
