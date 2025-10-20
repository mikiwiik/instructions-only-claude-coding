/**
 * Vercel KV store wrapper for shared todo lists
 */

import type { Todo } from '@/types/todo';

export interface SharedTodoList {
  id: string;
  todos: Todo[];
  lastModified: number;
  subscribers: string[];
}

/**
 * Simple in-memory store for development
 *
 * Note: This is a temporary implementation using Map for local development.
 * Production deployment will require migration to Vercel KV or similar persistent storage.
 * See: https://vercel.com/docs/storage/vercel-kv
 */
const store = new Map<string, SharedTodoList>();

export class KVStore {
  private static getListKey(listId: string): string {
    return `shared:list:${listId}`;
  }

  static async getList(listId: string): Promise<SharedTodoList | null> {
    const key = this.getListKey(listId);
    return store.get(key) || null;
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
    store.set(key, list);
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

    store.set(key, updated);
  }

  static async addSubscriber(listId: string, userId: string): Promise<void> {
    const key = this.getListKey(listId);
    const list = await this.getList(listId);

    if (!list) {
      throw new Error('List not found');
    }

    if (!list.subscribers.includes(userId)) {
      list.subscribers.push(userId);
      store.set(key, list);
    }
  }

  static async removeSubscriber(listId: string, userId: string): Promise<void> {
    const key = this.getListKey(listId);
    const list = await this.getList(listId);

    if (!list) {
      return;
    }

    list.subscribers = list.subscribers.filter((id) => id !== userId);
    store.set(key, list);
  }

  static async deleteList(listId: string): Promise<void> {
    const key = this.getListKey(listId);
    store.delete(key);
  }
}
