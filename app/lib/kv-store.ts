/**
 * Upstash Redis store wrapper for todo lists
 *
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.
 * See docs/setup/upstash-setup.md for configuration instructions.
 */

import { Redis } from '@upstash/redis';
import type { Todo } from '@/types/todo';

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface SharedTodoList {
  id: string;
  todos: Todo[];
  lastModified: number;
  subscribers: string[];
}

export class KVStore {
  private static getListKey(listId: string): string {
    return `shared:list:${listId}`;
  }

  static async getList(listId: string): Promise<SharedTodoList | null> {
    const key = this.getListKey(listId);
    return await redis.get<SharedTodoList>(key);
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
    await redis.set(key, list);
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
    await redis.set(key, updated);
  }

  static async addSubscriber(listId: string, userId: string): Promise<void> {
    const list = await this.getList(listId);

    if (!list) {
      throw new Error('List not found');
    }

    if (!list.subscribers.includes(userId)) {
      list.subscribers.push(userId);
      const key = this.getListKey(listId);
      await redis.set(key, list);
    }
  }

  static async removeSubscriber(listId: string, userId: string): Promise<void> {
    const list = await this.getList(listId);

    if (!list) {
      return;
    }

    list.subscribers = list.subscribers.filter((id) => id !== userId);
    const key = this.getListKey(listId);
    await redis.set(key, list);
  }

  static async deleteList(listId: string): Promise<void> {
    const key = this.getListKey(listId);
    await redis.del(key);
  }
}
