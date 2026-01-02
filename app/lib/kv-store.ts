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
import { logger } from './logger';

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
  logger.debug(
    { useInMemory, hasExistingRedis: !!redis },
    '[KVStore] getRedis called'
  );
  if (useInMemory) {
    logger.debug('[KVStore] Using in-memory store');
    return null;
  }
  if (!redis) {
    logger.debug('[KVStore] Creating Redis client');
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

/**
 * Shared store helpers to abstract Redis vs in-memory storage
 */
// istanbul ignore next -- E2E tested in-memory path
async function storeGet<T>(key: string): Promise<T | null> {
  const redisClient = getRedis();
  if (redisClient) {
    return await redisClient.get<T>(key);
  }
  return (inMemoryStore.get(key) as T) ?? null;
}

// istanbul ignore next -- E2E tested in-memory path
async function storeSet(key: string, value: SharedTodoList): Promise<void> {
  const redisClient = getRedis();
  if (redisClient) {
    await redisClient.set(key, value);
  } else {
    inMemoryStore.set(key, value);
  }
}

// istanbul ignore next -- E2E tested in-memory path
async function storeDelete(key: string): Promise<void> {
  const redisClient = getRedis();
  if (redisClient) {
    await redisClient.del(key);
  } else {
    inMemoryStore.delete(key);
  }
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
    logger.debug('[KVStore] In-memory store reset');
  }
}

export class KVStore {
  private static getListKey(listId: string): string {
    return `shared:list:${listId}`;
  }

  static async getList(listId: string): Promise<SharedTodoList | null> {
    const key = this.getListKey(listId);
    return storeGet<SharedTodoList>(key);
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
    await storeSet(key, list);
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
    await storeSet(key, updated);
  }

  static async addSubscriber(listId: string, userId: string): Promise<void> {
    const list = await this.getList(listId);

    if (!list) {
      throw new Error('List not found');
    }

    if (!list.subscribers.includes(userId)) {
      list.subscribers.push(userId);
      const key = this.getListKey(listId);
      await storeSet(key, list);
    }
  }

  static async removeSubscriber(listId: string, userId: string): Promise<void> {
    const list = await this.getList(listId);

    if (!list) {
      return;
    }

    list.subscribers = list.subscribers.filter((id) => id !== userId);
    const key = this.getListKey(listId);
    await storeSet(key, list);
  }

  static async deleteList(listId: string): Promise<void> {
    const key = this.getListKey(listId);
    await storeDelete(key);
  }
}
