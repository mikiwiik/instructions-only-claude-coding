/**
 * Upstash Redis store wrapper for todo lists
 * Uses Upstash Redis for persistent storage
 *
 * Note: This is a temporary in-memory implementation for development.
 * The Upstash client requires environment variables to be configured.
 * TODO: Replace with actual Upstash Redis client when env vars are set up
 */

import { Redis } from '@upstash/redis';
import type { Todo } from '@/types/todo';

// Initialize Upstash Redis client
// Falls back to a mock for environments without credentials
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export interface SharedTodoList {
  id: string;
  todos: Todo[];
  lastModified: number;
  subscribers: string[];
}

// In-memory fallback for development/testing without Upstash credentials
const memoryStore = new Map<string, SharedTodoList>();

export class KVStore {
  private static getListKey(listId: string): string {
    return `shared:list:${listId}`;
  }

  static async getList(listId: string): Promise<SharedTodoList | null> {
    const key = this.getListKey(listId);

    if (redis) {
      return await redis.get<SharedTodoList>(key);
    }

    // Fallback to in-memory store
    return memoryStore.get(key) ?? null;
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

    if (redis) {
      await redis.set(key, list);
    } else {
      memoryStore.set(key, list);
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

    if (redis) {
      await redis.set(key, updated);
    } else {
      memoryStore.set(key, updated);
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

      if (redis) {
        await redis.set(key, list);
      } else {
        memoryStore.set(key, list);
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

    if (redis) {
      await redis.set(key, list);
    } else {
      memoryStore.set(key, list);
    }
  }

  static async deleteList(listId: string): Promise<void> {
    const key = this.getListKey(listId);

    if (redis) {
      await redis.del(key);
    } else {
      memoryStore.delete(key);
    }
  }
}
